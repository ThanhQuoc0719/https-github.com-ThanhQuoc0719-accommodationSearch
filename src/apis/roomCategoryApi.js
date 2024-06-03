import axiosClient from "./axiosClient";

const roomCategoryApi = {
    createRoomCategory: (roomCategory) => {
        return axiosClient.post('/room-categories/create', roomCategory);
    },
    updateRoomCategory: (id, roomCategory) => {
        return axiosClient.put(`/room-categories/update/${id}`, roomCategory);
    },
    deleteRoomCategory: (id) => {
        return axiosClient.delete(`/room-categories/delete/${id}`);
    },
    searchRoomCategories: (keyword) => {
        return axiosClient.get('/room-categories/search', { params: { keyword } });
    },
    getAllRoomCategories: () => {
        return axiosClient.get('/room-categories/all');
    },
    getRoomCategoryById: (id) => {
        return axiosClient.get(`/room-categories/${id}`);
    }
};

export default roomCategoryApi;
