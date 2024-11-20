import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { IAdminService } from '../Interfaces/admin.service.interface';

export class AdminController {
  constructor(private adminService: IAdminService) {}

  registerAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      await this.adminService.registerAdmin({ name, email, password });
      res.status(201).json({ message: 'Admin created' });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

  adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { user, token , refreshToken } = await this.adminService.loginAdmin(email, password);
      res.cookie("admin_refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
     });
     res.cookie("admin_access_token", token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 15 * 60 * 1000,
     });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };

  listUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.adminService.listUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  listManager = async (req: Request, res: Response): Promise<void> => {
    try {
      const managers = await this.adminService.listManagers();
      res.status(200).json(managers);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  userBlock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body;
      const users = await this.adminService.toggleUserBlock(new Types.ObjectId(userId));
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  listHotels = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotels = await this.adminService.listHotels();
      res.status(200).json(hotels);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  approveHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hotelId } = req.params;
      const { status } = req.body;
      const hotel = await this.adminService.approveHotel(new Types.ObjectId(hotelId), status);
      res.status(200).json(hotel);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  listUnlistHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hotelId } = req.params;
      const { status } = req.body;
      const hotel = await this.adminService.listUnlistHotel(new Types.ObjectId(hotelId), status);
      res.status(200).json(hotel);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}