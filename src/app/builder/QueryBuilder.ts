import { FilterQuery, Query } from 'mongoose';

interface QueryObject {
  [key: string]: any; // Allows any additional fields
  price?: { $gte?: number; $lte?: number }; // Price filter type
  priceMin?: number;
  priceMax?: number;
}

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }

    return this;
  }

  filter() {
    const queryObj: QueryObject = { ...this.query }; // Typed as QueryObject
  
    // Fields to exclude from query
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);
  
    // Apply price filtering
    if (queryObj.priceMin !== undefined || queryObj.priceMax !== undefined) {
      queryObj.price = {}; // Initialize the price filter
  
      if (queryObj.priceMin !== undefined) {
        queryObj.price.$gte = queryObj.priceMin; // Set greater-than-or-equal
      }
  
      if (queryObj.priceMax !== undefined) {
        queryObj.price.$lte = queryObj.priceMax; // Set less-than-or-equal
      }
  
      delete queryObj.priceMin;
      delete queryObj.priceMax;
    }
  
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
  
    return this;
  }

  sort() {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;