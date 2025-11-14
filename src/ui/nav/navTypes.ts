// navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  TwoFactor: { sessionToken: string };
  JobQueue: undefined; // add params here if needed
};