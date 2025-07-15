import { login, signup } from './authController';
import {
    createGroup,
    deleteGroup,
    getGroupMessages,
    getGroups,
    myGroups,
    updateGroup,
    verifyGroupId,
} from './groupController';
import { myProfile, profileDetail, searchUsers } from './profileController';

export {
    myProfile,
    signup,
    login,
    createGroup,
    myGroups,
    verifyGroupId,
    searchUsers,
    profileDetail,
    updateGroup,
    deleteGroup,
    getGroupMessages,
    getGroups,
};
