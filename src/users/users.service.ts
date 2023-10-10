import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.schema';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';


@Injectable()
export class UsersService {
  private readonly apiKey: string;
  private readonly baseUrlCodeGeo = 'https://api.opencagedata.com/geocode/v1/json'

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService 
  ) {
    this.apiKey = this.configService.get<string>('API_KEY'); 
  }


  private async getLatLong(userDto: CreateUserDto): Promise<{lat: number, lng: number}> {
    try {
      const response = await axios.get(this.baseUrlCodeGeo, {
        params: {
          q: `${userDto.city} ${userDto.address}`,
          key: this.apiKey,
        }
      });
      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;
        return { lat, lng };
      } else {
        throw new HttpException(`City "${userDto.city}" Or Addres "${userDto.address}" not found`, HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch location data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } 

  async create(userDto: CreateUserDto): Promise<User> {
    try {
      const location = await this.getLatLong(userDto);
      const newUser = new this.userModel({
        ...userDto,
        homeLocation: {
          lat: location.lat,
          lng: location.lng,
        },
      });
      return newUser.save();
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(start: number, limit: number): Promise<any> {
    try {
      const users = await this.userModel.find().skip(start).limit(limit).exec();
      const total = await this.userModel.countDocuments();
      return {
        data: users,
        total,
      };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<User> {
    try {
      return this.userModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(error.message || 'User not found', HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findById(id).exec();
  
      let updateData: any = { ...userData };
      
      if (existingUser.city !== userData.city || existingUser.address !== userData.address) {
        const { lat, lng } = await this.getLatLong(userData);
        updateData = { 
          ...userData, 
          homeLocation: { lat, lng } 
        };
      }
      
      return await this.userModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
    } catch (error) {
      throw new HttpException(error.message || 'Failed to update user data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string): Promise<any> {
    try {
      return this.userModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new HttpException(error.message || 'Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
