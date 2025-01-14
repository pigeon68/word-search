class Config {
    static _instance;
    static getInstance() {
        if(!Config._instance) Config._instance = new Config();
        return Config._instance;
    }

    constructor() {
        this.data = null;
        this.translations = {};
        this.currentLanguage = 'en';
    }

    async loadLocalizations() {
        const languages = Object.keys(this.data.languages);
        const promises = [];

        for (let languageKey of languages) {
            const languageData = this.data.languages[languageKey];
            // console.log('Loading ' + languageData.filename + ' ...');

            promises.push(fetch('localization/' + languageData.filename)
                .then(response => response.json())
                .then(json => {
                    this.translations[languageKey] = json;
                    this.translations[languageKey].categories.forEach(category => {
                        category.wordsList = category.words.split(' ');
                        category.completeData = {easy: false, medium: false, hard: false, maniac: false}
                    })
                    //add random category
                    this.translations[languageKey].categories.unshift({
                        name: this.translations[languageKey].gui['random'],
                        words: '',
                        wordsList: null,
                        completeData: {easy: false, medium: false, hard: false, maniac: false}
                    });

                    return json;
                })
            )
        }

        const results = await Promise.all(promises);
        return results;
    }

    setLanguage(languageCode) {
        if(this.translations[languageCode]) {
            this.currentLanguage = languageCode;
            if(app) {
                app.emit('language_changed', this.currentLanguage);
            }
        } else {
            console.warn("setLanguage: No translation for '" + languageCode + "', fall back to 'en'");
        }
    }

    getBrowserLanguage() {
        return navigator.language.slice(0, 2);
    }

    getSiteLanguage() {
        let language = 'en';
        try {
            language = window.getCookie('cmg_translation') ||  window.parent.getCookie('cmg_translation');
        } catch (e) {
            console.log('Can not detect site language');
        }
        return language;
    }

    getLanguagesList() {
        return Object.keys(this.data.languages);
    }

    getLanguageData(key) {
        return this.data.languages[key];
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getCategoriesList(languageCode) {
        languageCode = languageCode || this.getCurrentLanguage();
        return this.translations[languageCode].categories;
    }

    getRandomChar(languageCode) {
        languageCode = languageCode || this.getCurrentLanguage();
        const alphabet = this.getLanguageData(languageCode).alphabet;
        if(alphabet) {
            return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        } else {
            return "";
        }
    }

    setCompleteData(languageCode, categoryName, easy, medium, hard, maniac) {
        const translation = this.translations[languageCode];
        if(!translation) return;
        const targetCategory = translation.categories.find(category => category.name === categoryName);
        if(targetCategory) {
            targetCategory.completeData.easy = easy;
            targetCategory.completeData.medium = medium;
            targetCategory.completeData.hard = hard;
            targetCategory.completeData.maniac = maniac;
        }
    }

    getProperty(key) {
        if(!this.data) {
            console.error("Config in not initialized yet"); return null;
        }
        if(!this.data.hasOwnProperty(key)) {
            console.error("Config has not property '" + key + "'"); return null;
        }
        return this.data[key];
    }

    getLocalizedText(textKey) {
        if(!this.translations[this.currentLanguage]) {
            console.warn("No translation for " + this.currentLanguage);
        }
        const localizationData = this.translations[this.currentLanguage].gui;
        if(!localizationData) return '{' + textKey + '}';
        return localizationData[textKey] || '{' + textKey + '}';
    }

    async loadConfig() {
        await fetch('config/game_config.json')
            .then(response => response.json())
            .then(data => {
                this.data = data;
            })
            .then(this.loadLocalizations.bind(this))
            .then(() => {
                console.log('Loaded translations: ', Object.keys(this.translations));
                const siteLanguage = this.getSiteLanguage();
                if(this.translations[siteLanguage]) {
                    this.setLanguage(siteLanguage);
                } else {
                    console.log("No translation for '" + siteLanguage + "', falling back to 'en'...");
                    this.setLanguage('en');
                }
            })
            .catch(error => {
                console.error("Can not load game config file: ", error);
            })
    }
}

