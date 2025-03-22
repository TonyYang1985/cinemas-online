import { Service } from 'typedi';

// User interface
interface User {
  id: string;
  email: string;
  name: string;
  department?: string;
}

@Service()
export class UserService {
  private users: User[] = [
    { id: '1', email: 'john@example.com', name: 'John Doe', department: 'Engineering' },
    { id: '2', email: 'jane@example.com', name: 'Jane Smith', department: 'Marketing' },
    { id: '3', email: 'bob@example.com', name: 'Bob Johnson', department: 'Sales' }
  ];

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async getOne(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }
  async createUser(userData: Partial<User>): Promise<User> {
    if (!userData.email || !userData.name) {
      throw new Error('Email and name are required');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      department: userData.department
    };

    this.users.push(newUser);
    return newUser;
  }

  async deleteUser(email: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.email !== email);
    return this.users.length < initialLength;
  }
}
