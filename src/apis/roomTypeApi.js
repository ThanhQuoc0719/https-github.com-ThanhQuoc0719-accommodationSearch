import axiosClient from "./axiosClient";

const roomTypeApi = {
    async addRoomType(roomTypeData) {
        try {
            const response = await axiosClient.post('/roomTypes', roomTypeData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async updateRoomType(id, roomTypeData) {
        try {
            const response = await axiosClient.put(`/roomTypes/${id}`, roomTypeData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async deleteRoomType(id) {
        try {
            const response = await axiosClient.delete(`/roomTypes/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getRoomTypeById(id) {
        try {
            const response = await axiosClient.get(`/roomTypes/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getAllRoomTypes() {
        try {
            const response = await axiosClient.get('/roomTypes');
            return response;
        } catch (error) {
            throw error;
        }
    },

    async searchRoomTypes(keyword) {
        try {
            const response = await axiosClient.get('/roomTypes/search', { params: { keyword } });
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getRoomTypesByUser(userId) {
        try {
            const response = await axiosClient.get(`/roomTypes/user/${userId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getRoomTypesByRoom(roomId) {
        try {
            const response = await axiosClient.get(`/roomTypes/room/${roomId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default roomTypeApi;
