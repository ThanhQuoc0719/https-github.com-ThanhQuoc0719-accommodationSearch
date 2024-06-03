import axiosClient from "./axiosClient";

const roomApi = {
    async addRoom(roomData) {
        try {
            const response = await axiosClient.post('/rooms', roomData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async updateRoom(id, roomData) {
        try {
            const response = await axiosClient.put(`/rooms/${id}`, roomData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async deleteRoom(id) {
        try {
            const response = await axiosClient.delete(`/rooms/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async searchRooms(keyword) {
        try {
            const response = await axiosClient.get('/rooms/search', { params: { keyword } });
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getAllRooms() {
        try {
            const response = await axiosClient.get('/rooms');
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getRoomsByUser(id) {
        try {
            const response = await axiosClient.get(`/rooms/user/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getRoomById(id) {
        try {
            const response = await axiosClient.get(`/rooms/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async approveRoom(id) {
        try {
            const response = await axiosClient.put(`/rooms/approve/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async denyRoom(id) {
        try {
            const response = await axiosClient.put(`/rooms/deny/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default roomApi;
