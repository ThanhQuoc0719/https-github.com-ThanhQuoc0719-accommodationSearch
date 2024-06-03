import axiosClient from "./axiosClient";

const bookmarkApi = {
    async bookmarkRoom(userId, roomId) {
        try {
            const response = await axiosClient.post(`/bookmarks/bookmark?roomId=${roomId}&userId=${userId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async unbookmarkRoom(userId, roomId) {
        try {
            const response = await axiosClient.delete('/bookmarks/unbookmark', { params: { userId, roomId } });
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getBookmarksByUser(userId) {
        try {
            const response = await axiosClient.get(`/bookmarks/user/${userId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default bookmarkApi;
