import React, {useCallback, useState} from 'react';
import {useIntl} from 'react-intl';
import {Alert, ScrollView, View, Text, TouchableOpacity, Modal, TextInput, Clipboard} from 'react-native';

import {translateText} from '@actions/remote/translate';
import {useServerUrl} from '@context/server';
import {useTheme} from '@context/theme';
import {dismissModal} from '@screens/navigation';
import {makeStyleSheetFromTheme} from '@utils/theme';

import type PostModel from '@typings/database/models/servers/post';

type Props = {
    post: PostModel;
};

const getStyleSheet = makeStyleSheetFromTheme((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.centerChannelBg,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.centerChannelColor + '20',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.centerChannelColor,
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: theme.centerChannelColor,
        fontWeight: 'bold',
    },
    originalText: {
        fontSize: 16,
        color: theme.centerChannelColor,
        backgroundColor: theme.centerChannelColor + '10',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        minHeight: 80,
    },
    languageSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    selectContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.centerChannelColor + '30',
        borderRadius: 8,
        backgroundColor: theme.centerChannelBg,
    },
    selectButton: {
        padding: 15,
        alignItems: 'center',
    },
    selectButtonText: {
        color: theme.centerChannelColor,
        fontSize: 16,
    },
    translateButton: {
        backgroundColor: theme.buttonBg,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    translateButtonText: {
        color: theme.buttonColor,
        fontSize: 16,
        fontWeight: 'bold',
    },
    translateButtonDisabled: {
        backgroundColor: theme.centerChannelColor + '30',
    },
    translateButtonTextDisabled: {
        color: theme.centerChannelColor + '60',
    },
    translationText: {
        fontSize: 16,
        color: theme.centerChannelColor,
        backgroundColor: theme.buttonBg + '20',
        padding: 15,
        borderRadius: 8,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    translationContainer: {
        position: 'relative',
    },
    copyButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: theme.buttonBg,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    copyButtonText: {
        color: theme.buttonColor,
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.centerChannelBg,
        borderRadius: 8,
        padding: 20,
        width: '80%',
        maxHeight: '60%',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    },
    modalCloseButtonText: {
        fontSize: 20,
        color: theme.centerChannelColor,
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.centerChannelColor,
        marginBottom: 15,
        textAlign: 'center',
    },
    languageOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.centerChannelColor + '20',
    },
    languageOptionText: {
        fontSize: 16,
        color: theme.centerChannelColor,
    },
    selectedLanguageOption: {
        backgroundColor: theme.buttonBg + '20',
    },
}));

const languages = [
    {code: 'en', name: 'English'},
    {code: 'ru', name: 'Russian'},
    {code: 'lv', name: 'Latvian'},
    {code: 'lt', name: 'Lithuanian'},
    {code: 'es', name: 'Spanish'},
    {code: 'fr', name: 'French'},
    {code: 'de', name: 'German'},
    {code: 'it', name: 'Italian'},
    {code: 'pt', name: 'Portuguese'},
];

const TranslateModal = ({post}: Props) => {
    const intl = useIntl();
    const theme = useTheme();
    const serverUrl = useServerUrl();
    const styles = getStyleSheet(theme);

    const [fromLang, setFromLang] = useState('auto');
    const [toLang, setToLang] = useState('ru');
    const [translation, setTranslation] = useState('');
    const [loading, setLoading] = useState(false);
    const [showFromModal, setShowFromModal] = useState(false);
    const [showToModal, setShowToModal] = useState(false);

    const handleTranslate = useCallback(async () => {
        if (!post.message) {
            return;
        }

        setLoading(true);
        try {
            const result = await translateText(serverUrl, post.message, fromLang, toLang);
            setTranslation(result);
        } catch (error) {
            Alert.alert(
                intl.formatMessage({
                    id: 'mobile.translate.error.title',
                    defaultMessage: 'Translation Error',
                }),
                intl.formatMessage({
                    id: 'mobile.translate.error.message',
                    defaultMessage: 'Failed to translate message. Please try again.',
                }),
            );
        } finally {
            setLoading(false);
        }
    }, [post.message, fromLang, toLang, serverUrl, intl]);

    const handleClose = useCallback(() => {
        dismissModal();
    }, []);

    const handleCopy = useCallback(() => {
        if (translation) {
            Clipboard.setString(translation);
        }
    }, [translation]);

    const getLanguageName = (code: string) => {
        if (code === 'auto') return 'Auto';
        return languages.find(lang => lang.code === code)?.name || code;
    };

    const LanguageSelector = ({value, onSelect, onPress, title, isFrom}: {value: string; onSelect: (code: string) => void; onPress: () => void; title: string; isFrom: boolean}) => (
        <View style={styles.selectContainer}>
            <TouchableOpacity style={styles.selectButton} onPress={onPress}>
                <Text style={styles.selectButtonText}>{getLanguageName(value)}</Text>
            </TouchableOpacity>
            <Modal visible={isFrom ? showFromModal : showToModal} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        if (isFrom) {
                            setShowFromModal(false);
                        } else {
                            setShowToModal(false);
                        }
                    }}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => {
                                if (isFrom) {
                                    setShowFromModal(false);
                                } else {
                                    setShowToModal(false);
                                }
                            }}
                        >
                            <Text style={styles.modalCloseButtonText}>×</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <ScrollView>
                            {isFrom && (
                                <TouchableOpacity
                                    style={[styles.languageOption, fromLang === 'auto' && styles.selectedLanguageOption]}
                                    onPress={() => {
                                        setFromLang('auto');
                                        setShowFromModal(false);
                                    }}
                                >
                                    <Text style={styles.languageOptionText}>Auto</Text>
                                </TouchableOpacity>
                            )}
                            {languages.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={[styles.languageOption, (isFrom ? fromLang : toLang) === lang.code && styles.selectedLanguageOption]}
                                    onPress={() => {
                                        if (isFrom) {
                                            setFromLang(lang.code);
                                            setShowFromModal(false);
                                        } else {
                                            setToLang(lang.code);
                                            setShowToModal(false);
                                        }
                                    }}
                                >
                                    <Text style={styles.languageOptionText}>{lang.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {intl.formatMessage({
                        id: 'mobile.translate.title',
                        defaultMessage: 'Translate message',
                    })}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
            </View>
            
            <ScrollView>
                <View style={styles.languageSelector}>
                    <LanguageSelector
                        value={fromLang}
                        onSelect={setFromLang}
                        onPress={() => setShowFromModal(true)}
                        title="Select source language"
                        isFrom={true}
                    />
                    <LanguageSelector
                        value={toLang}
                        onSelect={setToLang}
                        onPress={() => setShowToModal(true)}
                        title="Select target language"
                        isFrom={false}
                    />
                </View>

                <Text style={styles.originalText}>
                    {post.message}
                </Text>

                <TouchableOpacity
                    style={[
                        styles.translateButton,
                        loading && styles.translateButtonDisabled,
                    ]}
                    onPress={handleTranslate}
                    disabled={loading}
                >
                    <Text style={[
                        styles.translateButtonText,
                        loading && styles.translateButtonTextDisabled,
                    ]}>
                        {loading ? 'Translating...' : 'Translate'}
                    </Text>
                </TouchableOpacity>

                {translation && (
                    <View style={styles.translationContainer}>
                        <TextInput
                            style={styles.translationText}
                            value={translation}
                            multiline
                            editable={false}
                            selectTextOnFocus
                        />
                        <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                            <Text style={styles.copyButtonText}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default TranslateModal;
