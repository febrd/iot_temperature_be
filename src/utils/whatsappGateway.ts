import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../', '.env') });

const FONNTE_API_URL = process.env.FONNTE_API_URL;
const TOKEN = process.env.WHATSAPP_TOKEN;
const TARGET_WHATSAPP_GROUP = process.env.TARGET_WHATSAPP_GROUP;
const ALERT_TEMPERATURE = process.env.ALERT_TEMPERATURE;
const ALERT_HUMIDITY = process.env.ALERT_HUMIDITY;

if (!FONNTE_API_URL) {
    console.error('FONNTE_API_URL is not defined. Please check your .env file.');
    process.exit(1);
}

if (!TOKEN) {
    console.error('WHATSAPP_TOKEN is not defined. Please check your .env file.');
    process.exit(1);
}

if (!TARGET_WHATSAPP_GROUP) {
    console.error('Target WhatsApp group is not defined. Please check your .env file.');
    process.exit(1);
}

export { FONNTE_API_URL, TOKEN, TARGET_WHATSAPP_GROUP, ALERT_TEMPERATURE, ALERT_HUMIDITY };

const updateWhatsAppGroupList = async (token: string) => {
    try {
        const response = await axios.post('https://api.fonnte.com/fetch-group', {}, {
            headers: {
                Authorization: token,
            },
        });

        const { detail, status } = response.data;
        if (status === undefined || detail === undefined) {
            console.error('Unexpected response structure:', response.data);
            return;
        }

        if (!status) {
            console.error(`Error updating group list: ${detail}`);
            return;
        }

        console.log('Successfully updated group list:', detail);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error message:', error.response?.data || error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
};

const getWhatsAppGroups = async (token: string) => {
    try {
        const response = await axios.post('https://api.fonnte.com/get-whatsapp-group', {}, {
            headers: {
                Authorization: token,
            },
        });

        const { data, status } = response.data;
        if (status === undefined || data === undefined) {
            console.error('Unexpected response structure:', response.data);
            return;
        }

        if (!status) {
            console.error(`Error getting groups: ${data.detail}`);
            return;
        }

        console.log('Successful response:', data);
        return data; // Ensure that data is an array of groups
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error message:', error.response?.data || error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
};

const findGroupByName = (groups: any[], targetName: string) => {
    const foundGroup = groups.find(group => group.name === targetName);
    if (foundGroup) {
        return {
            id: foundGroup.id,
            name: foundGroup.name,
        };
    }
    console.error(`Group with name "${targetName}" not found.`);
    return null;
};


const getTargetGroupId = async () => {
    if (!TOKEN) {
        console.error('TOKEN is not defined.');
        return null; // or throw new Error('TOKEN is not defined');
    }

    const groups = await getWhatsAppGroups(TOKEN); 
    if (!groups) {
        console.error('Failed to fetch WhatsApp groups.');
        return null;
    }

    if (!TARGET_WHATSAPP_GROUP) {
        console.error('TARGET_WHATSAPP_GROUP is not defined.');
        return null; // or throw new Error('TARGET_WHATSAPP_GROUP is not defined');
    }

    const targetGroup = findGroupByName(groups, TARGET_WHATSAPP_GROUP);
    return targetGroup ? targetGroup.id : null;
};

export { updateWhatsAppGroupList, getWhatsAppGroups, findGroupByName, getTargetGroupId };
