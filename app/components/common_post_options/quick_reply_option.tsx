// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';

import {BaseOption} from '@components/common_post_options';
import {useServerUrl} from '@context/server';
import {t} from '@i18n';
import {forceLogoutIfNecessary} from '@actions/remote/session';
import {dismissBottomSheet} from '@screens/navigation';
import NetworkManager from '@managers/network_manager';

import type PostModel from '@typings/database/models/servers/post';
import type {AvailableScreens} from '@typings/screens/navigation';

type Props = {
    post: PostModel;
    bottomSheetId: AvailableScreens;
};

const QuickReplyOption = ({post, bottomSheetId}: Props) => {
    const serverUrl = useServerUrl();
    const [loading, setLoading] = useState(false);

    const handleQuickReply = useCallback(async () => {
        if (loading) {
            return;
        }

        setLoading(true);
        try {
            const client = NetworkManager.getClient(serverUrl);
            await client.quickReply(post.id, post.channelId);
            await dismissBottomSheet(bottomSheetId);
        } catch (error) {
            forceLogoutIfNecessary(serverUrl, error as ClientErrorProps);
        } finally {
            setLoading(false);
        }
    }, [post.id, post.channelId, bottomSheetId, serverUrl, loading]);

    return (
        <BaseOption
            i18nId={t('mobile.post_info.quick_reply')}
            defaultMessage='Quick Reply'
            iconName='reply-outline'
            onPress={handleQuickReply}
            testID='post_options.quick_reply.option'
        />
    );
};

export default QuickReplyOption;

