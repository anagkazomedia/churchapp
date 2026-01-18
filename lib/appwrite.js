import { Client, Account, Databases, Storage, Avatars, Query, ID } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';


const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('694512df0028c4ddf6c7')
    .setPlatform('com.churchapp.anagkazo'); 


client.config.storage = AsyncStorage; 


export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);   
export const avatars = new Avatars(client);   


export { Query, ID }; 

export const DATABASE_ID = '694513540013e5e86610'; 
export const COLLECTION_ID = '6945136f0028cb24ec36'; 
export const BUCKET_ID = '69501a2200380057bff2';

export default client;