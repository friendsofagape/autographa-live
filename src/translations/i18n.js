const path = require("path")
const fs = require('fs');
let loadedLanguage;
const rtlDetect = require('rtl-detect');
const refDb = require(`${__dirname}/../util/data-provider`).referenceDb();

module.exports = i18n;



function i18n() {
	loadedLanguage = refDb.get('app_locale').then(function(doc) {
		if(fs.existsSync(path.join(__dirname, doc.appLang + '.js'))) {
			return JSON.parse(fs.readFileSync(path.resolve(__dirname, doc.appLang + '.js'), 'utf8'))
		}
		else {
			return JSON.parse(fs.readFileSync(path.reslove(__dirname, 'en.js'), 'utf8'))
		}
	}).catch(function(error){
		console.log(__dirname)
		return JSON.parse(fs.readFileSync("./src/translations/en.js", 'utf8'))
	})
}

i18n.prototype.getLocale = function() {
	return refDb.get('app_locale').then(function(doc) {
		return doc.appLang;
	}).catch(function(error){
		return 'en';
	});
}

i18n.prototype.isRtl = function(){
	return this.getLocale().then((res) => rtlDetect.isRtlLang(res));
}

i18n.prototype.currentLocale = function() {
	return loadedLanguage.then(function(res){
		return res['0']
	})
}

i18n.prototype.__ = function(phrase) {
	return loadedLanguage.then(function(res){
		let translation = res[phrase]
		if(translation === undefined) {
	    	translation = phrase
	  	}
	  	return translation;
	})
}
