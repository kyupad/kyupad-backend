import { User } from '@/schemas/user.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EOnChainNetwork } from '@/enums';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async upsert(user: User, throwError = true): Promise<User | undefined> {
    try {
      const result = await this.userModel.findOneAndUpdate(
        { id: user.id },
        user,
        {
          upsert: true,
          new: true,
        },
      );

      return result;
    } catch (e) {
      this.logger.error(`Cannot upsert user [${user.id}]`, e);
      if (throwError) throw e;
    }
  }

  async findUserByWallet(
    wallet: string,
    network: EOnChainNetwork = EOnChainNetwork.SOLANA,
    throwError = true,
  ): Promise<User | undefined> {
    try {
      const user = await this.userModel.findOne({
        id: `${network}:${wallet}`,
      });
      return user ? (JSON.parse(JSON.stringify(user)) as User) : undefined;
    } catch (e) {
      this.logger.error(`Cannot get user [${wallet}]`, e);
      if (throwError) throw e;
    }
  }

  async update(
    id: string,
    data: Partial<User>,
    throwError = true,
  ): Promise<void> {
    try {
      const updateData: Partial<User> = {};
      if (data.email) {
        updateData.email = data.email;
      }
      if (Object.keys(updateData).length > 0)
        await this.userModel.updateOne(
          {
            id,
          },
          updateData,
        );
    } catch (e) {
      this.logger.error(`Cannot update user [${id}]`, e);
      if (throwError) throw e;
    }
  }
}
