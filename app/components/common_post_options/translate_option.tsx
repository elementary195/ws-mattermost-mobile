import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';

import {BaseOption} from '@components/common_post_options';
import {showModal, dismissBottomSheet} from '@screens/navigation';
import {Screens} from '@constants';

import type PostModel from '@typings/database/models/servers/post';
import type {AvailableScreens} from '@typings/screens/navigation';

type Props = {
    post: PostModel;
    bottomSheetId: AvailableScreens;
};

const TranslateOption = ({post, bottomSheetId}: Props) => {
    const intl = useIntl();

    const handleTranslate = useCallback(async () => {
        await dismissBottomSheet(bottomSheetId);
        
        showModal(
            Screens.TRANSLATE_MODAL,
            intl.formatMessage({
                id: 'mobile.translate.title',
                defaultMessage: 'Translate message',
            }),
            {post},
            {
                topBar: {
                    visible: false,
                },
            }
        );
    }, [post, intl, bottomSheetId]);

    return (
        <BaseOption
            i18nId="mobile.translate.option"
            defaultMessage="Translate message"
            iconName="forum-outline"
            onPress={handleTranslate}
            testID="post_options.translate_post.option"
        />
    );
};

export default TranslateOption;
