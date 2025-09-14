import React from 'react';

import AudioFile from '@components/files/audio_file';
import {buildAbsoluteUrl} from '@actions/remote/file';
import { useServerUrl } from '@context/server';
import type PostModel from '@typings/database/models/servers/post';

type Props = {
    post: PostModel;
    theme: Theme;
}


const VoiceMessage = ({post}: Props) => {
    const serverUrl = useServerUrl();

    const audioUrl = buildAbsoluteUrl(serverUrl, `/plugins/com.mattermost.voice/recordings/${post.id}`);
    
    const fileInfo = {
        id: post.id,
        uri: audioUrl,
        name: 'Voice Message',
        size: 0,
        extension: 'mp3',
        mime_type: 'audio/mpeg',
        has_preview_image: false,
        height: 0,
        width: 0,
        user_id: post.userId,
    };

    return (
        <AudioFile
            file={fileInfo}
            canDownloadFiles={true}
        />
    );
};

export default VoiceMessage; 