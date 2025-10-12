// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {General} from '@constants';

import type ClientBase from './base';

export interface ClientForwardMessageMix {
    quickReply: (postId: string, channelId: string) => Promise<{status: string}>;
}

const ClientForwardMessage = <TBase extends Constructor<ClientBase>>(superclass: TBase) => class extends superclass {
    quickReply = async (postId: string, channelId: string) => {
        return this.doFetch(
            `${this.getPluginRoute(General.FORWARD_MESSAGE_PLUGIN_ID)}/api/v1/quick-reply`,
            {method: 'post', body: {postId, channelId}},
        );
    };
};

export default ClientForwardMessage;

