import axiosClient from './axiosClient';

const newsApi = {
    /*Danh sách api category */

    createNews(data) {
        const url = '/news/search';
        return axiosClient.post(url, data);
    },
    getDetailNews(id) {
        const url = '/news/' + id;
        return axiosClient.get(url);
    },
    getDetailColor(id) {
        const url = '/color/' + id;
        return axiosClient.get(url);
    },
    getListNews() {
        const url = '/news';
        return axiosClient.get(url);
    },
    getListColor(data) {
        const url = '/color/search';
        if(!data.page || !data.limit){
            data.limit = 10;
            data.page = 1;
        }
        return axiosClient.post(url,data);
    },
    deleteColor(id) {
        const url = "/color/" + id;
        return axiosClient.delete(url);
    },
    deleteNews(id) {
        const url = "/news/" + id;
        return axiosClient.delete(url);
    },
    searchNews(name) {
        const params = {
            keyword: name.target.value
        }
        const url = '/news/search';
        return axiosClient.get(url, { params });
    },
    searchColor(name) {
        const params = {
            name: name.target.value
        }
        const url = '/color/searchByName';
        return axiosClient.get(url, { params });
    },

    
}

export default newsApi;