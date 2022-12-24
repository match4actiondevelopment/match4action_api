export interface User {
  id: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  location?: string;
  description?: string;
  image?: string;
  resume?: string;
}
