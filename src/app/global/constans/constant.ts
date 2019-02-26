/**
 *
 */
export const constant = {
    studyTimeLimitMax: 3600,
    mainContentsActCode: ['PP1', 'PP2', 'RV1', 'RP1', 'MP1', 'MP2'],
    gameContentsActCode: ['CM', 'PS', 'FF'],
    contentInfoSendDelaySec: 3,
    contentInfoAnswerListPropNameMap: {
        quiz: {
            examPaperCode: 'crsAuthoringCode',
            contentsCode: 'contentsCode',
            firstAns: 'userAnswer',
            firstAnsYn: 'correctYN',
            answer: 'correctAnswer',
            applyYn: 'applyYN',
            completeYn: 'completeYn',
            itmCode: 'objectAuthoringCode',
            itmNo: 'questionNumber',
            questionTypeCode: 'projectAuthoringCode',
            skillCode: 'skillCode'
        },
        sayItQuiz: {
            examPaperCode: 'crsAuthoringCode',
            contentsCode: 'contentsCode',
            firstAns: 'fileUrl',
            fileUrl: 'attachfileURL',
            firstAnsYn: 'correctYN',
            answer: 'correctAnswer',
            applyYn: 'applyYN',
            completeYn: 'completeYn',
            itmCode: 'projectAuthoringCode',
            itmNo: 'questionNumber',
            // questionTypeCode: 'projectAuthoringCode',
            skillCode: 'skillCode'
        }
    },

    sound: {
        common: {
            buttonClick: 'ECP5_Com_Click_Sound-2.mp3',
            okBtnClick: 'ECP5_Com_OKClick_Sound.mp3',
            checkboxClick: 'ECP5_Com_Checkbox_Sound.mp3',
            noticePopup: 'ECP5_Com_noticePopup_Sound.mp3',
            stopLearningConfirm: 'ECP5_Com_StopLearningConfirm_GNar.mp3',
            pageMove: 'ECP5_Com_Page Move_Sound-6.mp3',
            particle1: 'ECP5_Com_Particle_Sound.mp3',
            praise: 'ECP5_CE_Page Change_Sound-2.mp3',
            pepperExcellent: 'ECP5_Com_Compliment_GNar06.mp3'
        },
        main: {
            weekTreeClick: 'ECP5_MA_WeektreeClick_sound-3.mp3',
            weekMove: 'ECP5_MA_WeekMove_sound-2.mp3',
            clubhouseClick: 'ECP5_MA_ClubhouseClick_sound-2.mp3',
            clubhouseTitle: 'ECP6_Menu_clubhouse.mp3',
            settingOpen: 'ECP5_MA_SettingOpen_sound.mp3',
            settingClick: 'ECP5_MA_SettingClick_sound.mp3',
            settingClose: 'ECP5_MA_SettingClose_sound-2.mp3',
            otherWeekClick: 'ECP5_WT_OtherWeekClick_Sound-2.mp3',
            weekTreeMoveComplete: 'ECP5_WT_MoveComplete_Sound.mp3',
            weekTreeStartLearning: 'ECP5_WT_StartLearning_Sound.mp3',
            withParentsTitle: 'ECP6_Menu_withparents.mp3',
            rewardSound1: "ECP5_MA_GetRewardItem_Sound-2.mp3",
            rewardSound2: "ECP5_MA_Clap_Sound.mp3",
            rewardSound3: "ECP5_MA_GetRewards_Gnar_Yuri.mp3",

            monster1Hurt1: 'ECP5_MA_SisHurts_Nar01.mp3',
            monster1Hurt2: 'ECP5_MA_SisHurts_Nar02.mp3',
            monster1Hurt3: 'ECP5_MA_SisHurts_Nar03.mp3',
            monster1Thanks1: 'ECP5_MA_SisThanks_Nar1.mp3',
            monster1Thanks2: 'ECP5_MA_SisThanks_Nar2.mp3',
            monster1Thanks3: 'ECP5_MA_SisThanks_Nar3.mp3',
            monster2Hurt1: 'ECP5_MA_BroHurts_Nar01.mp3',
            monster2Hurt2: 'ECP5_MA_BroHurts_Nar02.mp3',
            monster2Hurt3: 'ECP5_MA_BroHurts_Nar03.mp3',
            monster2Thanks1: 'ECP5_MA_BroThanks_Nar1.mp3',
            monster2Thanks2: 'ECP5_MA_BroThanks_Nar2.mp3',
            monster2Thanks3: 'ECP5_MA_BroThanks_Nar3.mp3',
            monster3Hurt1: 'ECP5_MA_MamaHurts_Nar01.mp3',
            monster3Hurt2: 'ECP5_MA_MamaHurts_Nar02.mp3',
            monster3Hurt3: 'ECP5_MA_MamaHurts_Nar03.mp3',
            monster3Thanks1: 'ECP5_MA_MamaThanks_Nar1.mp3',
            monster3Thanks2: 'ECP5_MA_MamaThanks_Nar2.mp3',
            monster3Thanks3: 'ECP5_MA_MamaThanks_Nar2.mp3',
            monster4Hurt1: 'ECP5_MA_PapaHurts_Nar01.mp3',
            monster4Hurt2: 'ECP5_MA_PapaHurts_Nar02.mp3',
            monster4Hurt3: 'ECP5_MA_PapaHurts_Nar03.mp3',
            monster4Thanks1: 'ECP5_MA_PapaThanks_Nar1.mp3',
            monster4Thanks2: 'ECP5_MA_PapaThanks_Nar2.mp3',
            monster4Thanks3: 'ECP5_MA_PapaThanks_Nar3.mp3',

            PP1Click: 'ECP5_MA_AnameChant_Gnar.mp3',
            PP2Click: 'ECP5_MA_AnamePlay_Gnar.mp3',
            RV1Click: 'ECP5_MA_AnameRead_Gnar.mp3',
            RP1Click: 'ECP5_MA_AnameCheck_Gnar.mp3',
            MP1Click: 'ECP5_MA_AnameSay_Gnar.mp3',
            MP2Click: 'ECP5_MA_AnameFind_Gnar.mp3',
        },
        flashcard: {
            openCard: 'ECP5_FC_OpenCard_Sound.mp3',
            closeCard: 'ECP5_FC_CloseCard_Sound.mp3',
            otherCard: 'ECP5_FC_OtherCard_Sound.mp3',
            puzzleTouch: 'ECP5_FC_PzStick_Sound.mp3',
            puzzleSeparate: 'ECP5_FC_PzSeparation_Sound.mp3',
            puzzleDisappear: 'ECP5_FC_PzDisappear_Sound-2.mp3'
        },
        bgmClass: {
            '/main-spring': '/common/ECP5_Com_Spring_BGM.mp3',
            '/main-summer': '/common/ECP5_Com_Summer_BGM.mp3',
            '/main-fall': '/common/ECP5_Com_Fall_BGM.mp3',
            '/main-winter': '/common/ECP5_Com_Winter_BGM.mp3',
            '/clubhouse': '/clubhouse/ECP5_Com_Clubhouse_BGM_2.mp3',
            '/with-parents': '/withParents/ECP5_Com_WithParents_BGM.mp3'
        },
        clubhouse: {
            PRClick: 'ECP5_PR_POLY_Reader_GNar.mp3',
            SAClick: 'ECP5_SA_Sing_Along_Gnar.mp3',
            PSClick: 'ECP5_PS_Photo_Shoot_GNar.mp3',
            FFClick: 'ECP5_MA_AnameFunFactory_Gnar.mp3',
            CMClick: 'ECP5_CM_Color_Magic_Gnar.mp3'
        },
        withParents: {
            meetGreetTitle: 'ECP5_meet_greet_title.mp3',
            vocabularyTitle: 'ECP6_vocabulary_lists_title.mp3',
            stickerChartsTitle: 'ECP5_sticker_charts_title.mp3',
            timeSpentTitle: 'ECP6_time_spent_title.mp3',
            progressTitle: 'ECP6_progress_title.mp3',
            reportsTitle: 'ECP6_reports_title.mp3',
        }
    },

    helpInfo: {
        front: {
            main: {title: 'ECP5 Main Page', count: 7, guide: true},
            main_2nd: {title: 'ECP5 Main Page', count: 7, guide: true},
            weekTree: {title: 'Activity Map', count: 4, guide: true},
            flashcardChantIt: {title: 'Chant it!', title2: 'Flashcards', count: 2, isArrow: true, arrowCls: 'chant'},
            flashcardReadIt: {title: 'Read it!', title2: 'Flashcards', count: 2, isArrow: true, arrowCls: 'read'},
            clubhouse: {title: 'Clubhouse', count: 4},
            polyReader: {title: 'POLY Reader', count: 2},
            // polyReaderViewer: {title: 'Viewer', count: 1},
            singAlong: {title: 'Sing Along', count: 2},
            // singAlongPlayer: {title: 'Sing Along Player', count: 4},
            colorMagic: {title: 'Color Magic', count: 3},
            // colorMagicActivity: {title: 'Color Magic Activity', count: 4},
            photoShoot: {title: 'Photo Shoot', count: 4},
            // photoShootGame: {title: 'Photo Shoot Game', count: 4},
            factory: {title: 'Fun Factory', count: 4},
            withParents: {title: 'With Parents', count: 4},
            meetGreet: {title: 'Meet & Greet', count: 2},
            vocabularyLists: {title: 'Vocabulary List', count: 4},
            stickerCharts: {title: 'Sticker Charts', count: 2},
            timeSpent: {title: 'Time Spent', count: 2},
            progress: {title: 'Progress', count: 4},
            report: {title: 'Reports', count: 3},
        },
        content: {
            PP1: {title: 'Chant it!', count: 3},
            PP2: {
                ac01: {title: 'Play it!', count: 3},
                ac02: {title: 'Play it!', count: 3}
            },
            RV1: {title: 'Read it!', count: 3},
            RP1: {
                ac01: {title: 'Check it!', count: 3},
                ac02: {title: 'Check it!', count: 3},
                ac03: {title: 'Check it!', count: 3},
                ac04: {title: 'Check it!', count: 3},
                ac05: {title: 'Check it!', count: 3},
                ac06: {title: 'Check it!', count: 3}
            },
            MP1: {title: 'Say it!', count: 9},
            MP2: {title: 'Find it!', count: 2},
            FF: {
                ac01: {title: 'Fun Factory', count: 5},
                ac02: {title: 'Fun Factory', count: 5},
                ac03: {title: 'Fun Factory', count: 5},
                ac04: {title: 'Fun Factory', count: 5},
                ac05: {title: 'Fun Factory', count: 5},
                ac06: {title: 'Fun Factory', count: 4}
            },
            FF_MO: {
                ac01: {title: 'Fun Factory', count: 4},
                ac02: {title: 'Fun Factory', count: 4},
                ac03: {title: 'Fun Factory', count: 4},
                ac04: {title: 'Fun Factory', count: 5},
                ac05: {title: 'Fun Factory', count: 5},
                ac06: {title: 'Fun Factory', count: 4}
            },
            PR: {title: 'POLY Reader', count: 3},
            SA: {title: 'Sing Along', count: 2},
            CM: {title: 'Color Magic', count: 3},
            PS: {title: 'Photo Shoot', count: 3}
        }
    }
};
