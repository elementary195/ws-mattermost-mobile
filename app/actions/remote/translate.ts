import {getServerCredentials} from '@init/credentials';

export const translateText = async (serverUrl: string, text: string, fromLang: string, toLang: string): Promise<string> => {
    try {
        const credentials = await getServerCredentials(serverUrl);
        if (!credentials?.token) {
            throw new Error('No authentication token available');
        }

        const response = await fetch(`${serverUrl}/plugins/com.mattermost.plugin-translate-button/api/v1/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.token}`,
            },
            body: JSON.stringify({
                text,
                from: fromLang,
                to: toLang,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.translation;
        } else {
            throw new Error('Translation failed');
        }
    } catch (error) {
        throw new Error('Translation failed');
    }
};
