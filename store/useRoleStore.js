import { create } from 'zustand';

const useRoleStore = create((set) => ({
    userRoles: null,
    setUserRoles: (roles) => set({ userRoles: roles }),
    hasRole: (role) => {
        const state = useRoleStore.getState();
        return state.userRoles ? state.userRoles[role] === true : false;
    },
    clearRoles: () => set({ userRoles: null }),
}));

export default useRoleStore; 