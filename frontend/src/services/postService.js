import api from './api';

export const postService = {
  async getPosts(params) {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  async getPostById(id) {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  async createPost(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'images') {
        data.images.forEach(image => {
          formData.append('images', image);
        });
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updatePost(id, data) {
    const response = await api.patch(`/posts/${id}`, data);
    return response.data;
  },

  async deletePost(id) {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  async getProposals(postId) {
    const response = await api.get(`/posts/${postId}/proposals`);
    return response.data;
  },

  async createProposal(postId, data) {
    const response = await api.post(`/posts/${postId}/proposals`, data);
    return response.data;
  },
};
