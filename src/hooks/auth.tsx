import React, { createContext, useCallback, useContext, useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';
import { useEffect } from 'react';

interface AuthState {
  token: string;
  user: Object;
}

interface SignCredentials {
  email: string;
  password: string;
}

interface AuthContexData {
  user: Object;
  loading: boolean;
  signOut(): void;
  signIn(credencials: SignCredentials): Promise<void>;
}

const AuthContext = createContext<AuthContexData>({} as AuthContexData);

export const AuthProvider: React.FC = ({ children }) => {
    const [data, setData] = useState<AuthState>({} as AuthState);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        async function loadStorageData(){
            const [token, user] = await AsyncStorage.multiGet([
                '@GoBarber:token',
                '@GoBarber:user',
            ]);
           
            if(token[1] && user[1]){
                setData({ token:token[1], user:JSON.parse(user[1]) })
            }
            setLoading(false)
        }
        loadStorageData();
    },[]);      

    const signIn = useCallback(async ({ email, password }) => {
        const response = await api.post('sessions', {
        email,
        password,
        });

        const { token, user } = response.data;

        await AsyncStorage.multiSet([
            ['@GoBarber:token',token],
            ['@GoBarber:user',JSON.stringify(user)],
        ]);
        setData({token, user})
    }, []);

    const signOut = useCallback(async() => {
        
        await AsyncStorage.multiRemove([ '@GoBarber:token', '@GoBarber:user']);
    
        setData({} as AuthState);
    }, []);

    return (
        <AuthContext.Provider value={{ user: data.user, loading ,signIn, signOut }}>
        {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContexData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used wihin as AuthProvider');
  }

  return context;
}
