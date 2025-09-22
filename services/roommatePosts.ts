// Legacy service - redirects to new unified posts API
import { getPosts, getPostById, createPost, updatePost, deletePost } from './posts';
import { Post } from '../types/Post';

// Legacy function names for backward compatibility
export const listRoommatePosts = (params?: any) => getPosts({ postType: 'roommate', ...params });
export const getRoommatePostById = (id: number) => getPostById(id);
export const createRoommatePost = (data: any) => createPost(data);
export const updateRoommatePost = (id: number, data: any) => updatePost(id, data);
export const deleteRoommatePost = (id: number) => deletePost(id);

// Legacy types
export type RoommatePost = Post;