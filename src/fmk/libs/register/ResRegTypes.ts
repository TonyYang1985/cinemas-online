export type HttpMethodsRegistry = {
    [parentPath: string]: {
      [path: string]: Array<{
        app: string | string[];
        functionName: string;
        method: string;
        _apiName: string;
      }>;
    };
  };
  
  export type UIRegistry = {
    [uiName: string]: {
      app: string | string[];
      functionName: string;
    };
  };
  
  export type MenuRegistry = UIRegistry;