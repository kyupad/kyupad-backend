import { User } from '@/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async upsert(user: User): Promise<User> {
    const result = await this.userModel.findOneAndUpdate(
      { id: user.id },
      user,
      {
        upsert: true,
        new: true,
      },
    );

    return result;
  }
}
