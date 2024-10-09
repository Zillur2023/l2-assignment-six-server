
export type TErrorMessages = {
    path: string | number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any;
  }[];
  
  export type TGenericErrorResponse = {
    statusCode: number;
    message: string;
    errorMessages: TErrorMessages;
  };