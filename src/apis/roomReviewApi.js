import axiosClient from "./axiosClient";

const roomReviewApi = {
    async addRoomReview(roomId, reviewData) {
        try {
            const response = await axiosClient.post(`/room-reviews/${roomId}`, reviewData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getRoomReviews(roomId) {
        try {
            const response = await axiosClient.get(`/room-reviews/room/${roomId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default roomReviewApi;
