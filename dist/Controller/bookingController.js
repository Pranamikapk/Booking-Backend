"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
class BookingController {
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    async createBooking(req, res) {
        try {
            const result = await this.bookingService.createBooking(req.body, req.user_id);
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error creating booking:', error);
            res.status(500).json({ message: 'Error creating booking', error: error.message });
        }
    }
    async verifyPayment(req, res) {
        try {
            const updatedBooking = await this.bookingService.verifyPayment(req.body, req.body.bookingId);
            res.status(200).json({
                message: 'Payment verified and booking completed successfully',
                booking: updatedBooking,
            });
        }
        catch (error) {
            console.error('Error verifying payment:', error);
            res.status(500).json({ message: 'Failed to verify payment', error: error.message });
        }
    }
    async listBookings(req, res) {
        try {
            const userId = req.user_id;
            if (!userId) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            const bookings = await this.bookingService.listBookings(userId);
            res.status(200).json(bookings);
        }
        catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({ message: 'Error fetching bookings', error: error.message });
        }
    }
    async bookingDetails(req, res) {
        try {
            const bookingId = req.params.bookingId;
            const booking = await this.bookingService.getBookingDetails(bookingId);
            res.status(200).json(booking);
        }
        catch (error) {
            console.error("Error fetching booking details:", error);
            res.status(500).json({ message: 'Error fetching booking details', error: error.message });
        }
    }
    async listReservations(req, res, next) {
        try {
            const managerId = req.params.managerId;
            if (!managerId) {
                res.status(401).json({ message: 'Manager not authenticated' });
                return;
            }
            const reservations = await this.bookingService.listReservations(managerId);
            res.status(200).json(reservations);
        }
        catch (error) {
            console.error("Error fetching reservations:", error);
            next(error);
        }
    }
    async cancelRequest(req, res) {
        try {
            const { bookingId, reason } = req.body;
            const result = await this.bookingService.cancelRequest(bookingId, reason);
            res.status(201).json({
                message: 'Cancellation request submitted successfully.',
                ...result
            });
        }
        catch (error) {
            console.error('Error in cancelRequest:', error);
            res.status(500).json({ message: 'Error submitting cancellation request', error: error.message });
        }
    }
    async cancelApprove(req, res) {
        try {
            const result = await this.bookingService.cancelApprove(req.params.bookingId);
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error approving cancellation:', error);
            res.status(500).json({ message: 'Error approving cancellation', error: error.message });
        }
    }
    async cancelReject(req, res) {
        try {
            const result = await this.bookingService.cancelReject(req.params.bookingId);
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error rejecting cancellation:', error);
            res.status(500).json({ message: 'Error rejecting cancellation', error: error.message });
        }
    }
}
exports.BookingController = BookingController;
