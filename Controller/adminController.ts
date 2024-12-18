import { Request, Response } from 'express';
import { Types } from 'mongoose';
import HTTP_statusCode from '../Enums/httpStatusCodes';
import { IDashboardService } from '../Interfaces/admin.dashboard.interface';
import { IAdminService } from '../Interfaces/admin.service.interface';

export class AdminController {
  constructor(private adminService: IAdminService,
    private dashboardService: IDashboardService
  ) {}

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
      console.log("User:",user,"Token:" ,token,"Refresh:",refreshToken);
      
     res.cookie("admin_access_token", token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 15 * 60 * 1000,
     });
     res.cookie("admin_refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
   });
      res.status(HTTP_statusCode.OK).json({message:"Logged In Successfully",user,token});
    } catch (error) {
      res.status(HTTP_statusCode.BadRequest).json({ message: (error as Error).message });
    }
  };

  // refreshToken = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const refreshToken = req.cookies.admin_refresh_token;
  //     if (!refreshToken) {
  //       res.status(HTTP_statusCode.Unauthorized).json({ message: 'Refresh token not found' });
  //       return;
  //     }

  //     const { user, token, refreshToken: newRefreshToken } = await this.adminService.refreshToken(refreshToken);

  //     res.cookie("admin_refresh_token", newRefreshToken, {
  //       httpOnly: true,
  //       sameSite: 'none',
  //       secure: true,
  //       maxAge: 7 * 24 * 60 * 60 * 1000,
  //     });
  //     res.cookie("admin_access_token", token, {
  //       httpOnly: true,
  //       sameSite: 'none',
  //       secure: true,
  //       maxAge: 15 * 60 * 1000,
  //     });

  //     res.status(HTTP_statusCode.OK).json({
  //       message: "Token refreshed successfully",
  //       user: {
  //         _id: user._id,
  //         name: user.name,
  //         email: user.email,
  //         role: user.role,
  //       },
  //       token,
  //     });
  //   } catch (error) {
  //     res.status(HTTP_statusCode.Unauthorized).json({ message: (error as Error).message });
  //   }
  // };

  listUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.adminService.listUsers();
      res.status(HTTP_statusCode.OK).json(users);
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Internal Server Error' });
    }
  };

  listManager = async (req: Request, res: Response): Promise<void> => {
    try {
      const managers = await this.adminService.listManagers();
      res.status(HTTP_statusCode.OK).json(managers);
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Internal Server Error' });
    }
  };

  userBlock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body;
      const users = await this.adminService.toggleUserBlock(new Types.ObjectId(userId));
      res.status(HTTP_statusCode.OK).json(users);
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Internal Server Error' });
    }
  };

  managerBlock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { managerId } = req.body;
      const managers = await this.adminService.toggleUserBlock(new Types.ObjectId(managerId));
      res.status(HTTP_statusCode.OK).json(managers);
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Internal Server Error' });
    }
  };

  listHotels = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotels = await this.adminService.listHotels();
      res.status(HTTP_statusCode.OK).json(hotels);
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Internal Server Error' });
    }
  };

  approveHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hotelId } = req.params;
      const { status } = req.body;
      const hotel = await this.adminService.approveHotel(new Types.ObjectId(hotelId), status);
      res.status(HTTP_statusCode.OK).json(hotel);
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Internal Server Error' });
    }
  };

  listUnlistHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hotelId } = req.params;
      const { status } = req.body;
      const hotel = await this.adminService.listUnlistHotel(new Types.ObjectId(hotelId), status);
      res.status(HTTP_statusCode.OK).json(hotel);
    } catch (error) {
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Internal Server Error' });
    }
  };

  getDashboardStats = async(req: Request, res: Response):Promise<void> => {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      res.status(HTTP_statusCode.OK).json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(HTTP_statusCode.InternalServerError).json({ message: 'Error fetching dashboard stats' });
    }
  }
}