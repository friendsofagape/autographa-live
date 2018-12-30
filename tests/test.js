const Application = require('spectron').Application;
const path = require('path');
const chai = require('chai');
var assert = require('assert');
const chaiAsPromised = require('chai-as-promised');
const fs = require("fs");

const electron = require('spectron').remote;

const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
    + (process.platform === 'win32' ? '.cmd' : "");

const appPath = path.join(__dirname, '..');

const app = new Application({
    path: electronPath,
    args: [appPath]
});

const now = new Date();
const wacsRepoId = `e2e_${now.getTime()}`;
const timestampedSampleText = `this is a test ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getTime()}`;
const wacsUsername = process.env.WACS_USERNAME;
const wacsPassword = process.env.WACS_PASSWORD;


global.before(function () {
    chai.should();
    chai.use(chaiAsPromised);
});


describe('Autographa Test', () => {
    before(function () {
        return app.start();
    });

    after(() => {
        return app.stop();
    });

    it('opens a window', () => {
        return app.client.waitUntilWindowLoaded()
            .getWindowCount().should.eventually.equal(1);
    });

    it('tests the title', () => {
        return app.client.waitUntilWindowLoaded()
            .getTitle().should.eventually.equal('Autographa Live');
    });

    it('should check empty chapter not found', () => {
        return app.client.waitUntilWindowLoaded()
            .click(".translation > a")
            .getText(".empty-chapter-report").should.eventually.equal('1-50')
    });

    it('should check incomplete verse not found', () => {
        return app.client.waitUntilWindowLoaded()
            .getText(".incomplete-verse-report").should.eventually.equal('Not found.');
    });

    it('should check multiple space of verse not found', () => {
        return app.client.waitUntilWindowLoaded()
            .getText(".multiple-space-report").should.eventually.equal('Not found.');
    });

    it('close the app', () => {
        return app.stop();
    });

    it('open the app', () => {
        return app.start();
    });

    it('should check reference verse exist', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForExist("#v1", 20000)
            .getText("div[data-verse='r1']>.verse-num").should.eventually.equal('1')
    });


    it('should check book button', () => {
        return app.client.waitUntilWindowLoaded()
            .getText('#book-chapter-btn').should.eventually.equal('Genesis');
    });

    it('should save the target text', () => {
        return app.client.waitUntilWindowLoaded()
            .keys('Tab')
            .waitForVisible("#versediv1", 20000)
            .click("#versediv1")
            .keys(timestampedSampleText)
            .click("#versediv2")
            .keys('check    for spaces')
            .click("#versediv3")
            .keys('incompleteVerse')
            .waitForExist("#save-btn", 20000)
            .click('#save-btn')
            .getText("#v1").should.eventually.equal(timestampedSampleText);
    });

    it('should click the ref drop down', () => {
        return app.client.waitUntilWindowLoaded()
            .click(".ref-drop-down")
            .getValue('.ref-drop-down').should.eventually.equal('eng_ult')
    });

    it('should check the verse in translation panel', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForVisible("#v1", 20000)
            .getText("#v1").should.eventually.equal(timestampedSampleText);
    });


    it('should change the ref drop down text', () => {
        return app.client.waitUntilWindowLoaded()
            .click(".ref-drop-down")
            .selectByIndex(".ref-drop-down", 1)
            .getValue('.ref-drop-down').should.eventually.equal('eng_ust');
    });


    it('After ref change should check the verse again in translation panel', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForVisible("#v1", 20000)
            .getText("#v1").should.eventually.equal(timestampedSampleText);
    });

    it('should check highlight verse on 2x', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForExist("#v1", 20000)
            .click("#versediv1")
            .getAttribute("div[data-verse='r1']", 'style').should.eventually.equal(
                'background-color: rgba(11, 130, 255, 0.1); padding-left: 10px; padding-right: 10px; border-radius: 10px;')
    });

    it('should change the ref drop down text eng_ult', () => {
        return app.client.waitUntilWindowLoaded()
            .click(".ref-drop-down")
            .selectByIndex(".ref-drop-down", 0)
            .getValue('.ref-drop-down').should.eventually.equal('eng_ult');
    });

    it('should open the settings popup and save setting', () => {
        return app.client.waitUntilWindowLoaded()
            .keys('Escape')
            .waitForEnabled("#btnSettings", 2000)
            .click("#btnSettings")
            .waitForVisible("#lang-code", 2000)
            .setValue("#lang-code", 'eng')
            .keys('Tab')
            .setValue("#lang-version", "NET-S3")
            .setValue("#export-folder-location", appPath)
            .waitForExist("#save-setting", 20000)
            .click("#save-setting")
            .keys("Escape")

    });

    it('close the app', () => {
        return app.stop();
    });

    it('open the app', () => {
        return app.start();
    });

    it('should check the saved target verse', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForVisible("#v1", 20000)
            .getText("#v1").should.eventually.equal(timestampedSampleText);
    });

    it('should click the diff button and count addition', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForEnabled('#diff', 20000)
            .click('#diff')
            .waitForExist("#tIns", 20000)
            .getText("#tIns").should.eventually.equal('13');
    });

    it('should click off the diff button', () => {
        return app.client.waitUntilWindowLoaded()
            .click('#diff');
    });

    it('should click the diff button and count deletion', () => {
        return app.client.waitUntilWindowLoaded()
            .click('#diff')
            .waitForExist("#tDel", 20000)
            .getText("#tDel").should.eventually.equal('713');
    });

    it('should click off the diff button', () => {
        return app.client.waitUntilWindowLoaded()
            .click('#diff');
    });

    it('should check chapter button', () => {
        return app.client.waitUntilWindowLoaded()
            .getText('#chapterBtn').should.eventually.equal('1');
    });

    it('should change layout to 3x', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForEnabled("#btn-3x", 20000)
            .click("#btn-3x")
            .getText('.layout2x').should.eventually.exist;

    });

    it('Should keep newly saved text viewable when layout changes to 3x', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForVisible("#v1", 20000)
            .getText("#v1").should.eventually.equal(timestampedSampleText);
    });


    it('should check highlight verse on 3x', () => {
        let style = 'background-color: rgba(11, 130, 255, 0.1); padding-left: 10px; padding-right: 10px; border-radius: 10px;';
        let matched = true;
        return app.client.waitUntilWindowLoaded()
            .waitForExist("#v1", 20000)
            .click("#versediv1")
            .getAttribute("div[data-verse='r1']", 'style').then((res) => {
                res.forEach((data) => {
                    if (style !== data) {
                        matched = false
                    }
                })
                assert.strictEqual(true, matched, "style matched");
            })
    });

    it('should change layout to 4x', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForEnabled("#btn-4x", 20000)
            .click("#btn-4x")
            .getText('.layout3x').should.eventually.exist;
    });

    it('Should keep newly saved text viewable when layout changes to 4x', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForVisible("#v1", 20000)
            .getText("#v1").should.eventually.equal(timestampedSampleText);
    });


    it('should check highlight verse on 4x', () => {
        let style = 'background-color: rgba(11, 130, 255, 0.1); padding-left: 10px; padding-right: 10px; border-radius: 10px;';
        let matched = true;
        return app.client.waitUntilWindowLoaded()
            .waitForExist("#v1", 20000)
            .click("#versediv1")
            .getAttribute("div[data-verse='r1']", 'style').then((res) => {
                res.forEach((data) => {
                    if (style !== data) {
                        matched = false
                    }
                })
                assert.strictEqual(true, matched, "style matched");
            })
    });


    it('should change layout to 2x', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForEnabled("#btn-2x", 20000)
            .click("#btn-2x")
            .getText('.layoutx').should.eventually.exist;
    });

    it("should export the 1 column html file", () => {
        return app.client.waitUntilWindowLoaded()
            .click(".dropdown-toggle")
            .click("#export-1-column")
            .waitForVisible(".swal-text", 2000)
            .getText(".swal-text").then((res) => {
                if (fs.existsSync(res.replace("Exported file at: ", ""))) {
                    assert.strictEqual(true, true, "file exported at the saved location");
                    fs.unlinkSync(res.replace("Exported file at: ", ""))
                } else {
                    assert.strictEqual(true, false, "file doesn't exported at saved location");
                }
            }, (err) => {
                assert.strictEqual(true, false, "file doesn't exported at saved location");
            })
            .keys('Escape')
    });

    it("should export the 2 column html file", () => {
        return app.client.waitUntilWindowLoaded()
            .click(".dropdown-toggle")
            .click("#export-2-column")
            .waitForVisible(".swal-text", 2000)
            .getText(".swal-text").then((res) => {
                if (fs.existsSync(res.replace("Exported file at: ", ""))) {
                    assert.strictEqual(true, true, "file exported at the saved location");
                    fs.unlinkSync(res.replace("Exported file at: ", ""))
                } else {
                    assert.strictEqual(true, false, "file doesn't exported at saved location");
                }
            }, (err) => {
                assert.strictEqual(true, false, "file doesn't exported at saved location");
            })
            .keys('Escape')
    });

    it("should export the usfm file", () => {
        return app.client.waitUntilWindowLoaded()
            .click(".dropdown-toggle")
            .click("#export-usfm-file")
            .waitForVisible("#stageText", 2000)
            .keys("Tab")
            .keys("Tab")
            .keys("Tab")
            .keys("#stageText", "stage1-export-demo")
            .keys("Tab")
            .waitForExist("#btn-export-usfm", 2000)
            .keys("Tab")
            .click("#btn-export-usfm > div > div")
            .waitForVisible(".swal-text", 2000)
            .getText(".swal-text").then((res) => {
                if (fs.existsSync(res.replace("Exported file at:", ""))) {
                    assert.strictEqual(true, true, "file exported at the saved location");
                    fs.unlinkSync(res.replace("Exported file at:", ""))
                } else {
                    assert.strictEqual(true, false, "file doesn't exported at saved location");
                }
            }, (err) => {
                console.log(err)
                assert.strictEqual(true, false, "file doesn't exported at saved location");
            })
            .keys('Escape')
            .waitForVisible("#tab-search", 2000, true)
    });


    it('should check empty chapter report', () => {
        return app.client.waitUntilWindowLoaded()
            .waitForVisible(".translation > a")
            .click(".translation > a")
            .getText(".empty-chapter-report").should.eventually.equal('2-50')
    });

    it('should check incomplete verse report', () => {
        return app.client.waitUntilWindowLoaded()
            .getText(".incomplete-verse-report").should.eventually.equal('1:3');
    });

    it('should check multiple space in verse report', () => {
        return app.client.waitUntilWindowLoaded()
            .getText(".multiple-space-report").should.eventually.equal('1:2');
    });

    it('close the app', () => {
        return app.stop();
    });

    describe('paratext', () => {
        it('open the app', () => {
            return app.start();
        });

        it('should login to paratext and get projects list', () => {
            return app.client.waitUntilWindowLoaded()
                .keys('Escape')
                .waitForEnabled("#btnSettings", 2000)
                .click("#btnSettings")

                .waitForVisible("#loading-img", 10000, true)
                .waitForVisible("#left-tabs-example-tab-seventh")
                .click("#left-tabs-example-tab-seventh")

                .waitForVisible(".panel-title > a")
                .click(".panel-title > a")

                .waitForVisible("#paratext-username")
                .setValue("#paratext-username", 'Benjamin Autographa')
                .setValue("#paratext-password", "XG5MNJ-P8M1XG-03H274-Y8G0KP-BKG4FW")
                .waitForVisible("#paratext-signin")
                .click("#paratext-signin")

                .waitForVisible("#projectList .panel-title > a")
                .getText("#projectList .panel-title > a").should.eventually.contain('MAL10AUT')
        });

        it('should select book and upload to paratext', () => {
            return app.client.waitUntilWindowLoaded()
                .waitForVisible("#projectList .panel-title > a")
                .click("#projectList .panel-default:last-child .panel-title a")
                .waitForVisible("#project-list .checkbox-inline input[type='checkbox']", 5000)
                .keys('Tab')
                .keys(' ')
                .waitForSelected('#GEN', 50000)
                .waitForVisible("a.btn-upload", 60000)
                .click("a.btn-upload")
                .waitForVisible(".swal-button--confirm", 60000)
                .click(".swal-button--confirm")
                .waitForVisible("#loading-img", 60000, true)
                .waitForVisible(".swal-title", 60000)
                .getText(".swal-title").should.eventually.equal("Book Exported");
        });

        it('close the app', () => {
            return app.stop();
        });

        it('open the app', () => {
            return app.start();
        });

        it('should login to paratext and get projects list', () => {
            return app.client.waitUntilWindowLoaded()
                .keys('Escape')
                .waitForEnabled("#btnSettings", 2000)
                .click("#btnSettings")

                .waitForVisible("#loading-img", 10000, true)
                .waitForVisible("#left-tabs-example-tab-seventh")
                .click("#left-tabs-example-tab-seventh")

                .waitForVisible("#projectList .panel-title > a")
                .getText("#projectList .panel-title > a").should.eventually.contain('MAL10AUT')
        });

        it('should get the list of projects and import book', () => {
            return app.client.waitUntilWindowLoaded()
                .waitForVisible("#projectList .panel-title > a", 5000)
                .click("#projectList .panel-default:last-child .panel-title a")
                .waitForVisible("#project-list .checkbox-inline input[type='checkbox']", 5000)
                .keys('Tab')
                .keys(' ')
                .waitForSelected('#GEN', 5000)
                .waitForVisible("a.btn-import", 60000)
                .click("a.btn-import")
                .waitForVisible(".swal-button--confirm", 60000)
                .click(".swal-button--confirm", 20000)
                .waitForVisible("#loading-img", 60000, true)
                .getText(".swal-title").then((res) => {
                    assert.strictEqual(true, true, "Import");
                })


        });

        it('close the app', () => {
            return app.stop();
        });

        it('open the app', () => {
            return app.start();
        });

        it('should check the imported text', () => {
            return app.client.waitUntilWindowLoaded()
                .keys('Tab')
                .waitForVisible("#versediv1", 20000)
                .click("#versediv1")
                .getText("#v1").should.eventually.include(timestampedSampleText);
        });

        it('close the app', () => {
            return app.stop();
        });
    });

    describe('wacs', () => {
        before(() => {
            const should = chai.should();
            should.exist(wacsUsername, "WACS_USERNAME environment variable isn't set");
            should.exist(wacsPassword, "WACS_PASSWORD environment variable isn't set");
            return app.start();
        });

        it('should login to wacs and get projects list', () => {
            return app.client.waitUntilWindowLoaded()
                .waitForEnabled("#btnSettings", 2000)
                .click("#btnSettings")

                .waitForVisible("#loading-img", 10000, true)
                .waitForVisible("#left-tabs-example-tab-seventh")
                .click("#left-tabs-example-tab-seventh")

                .waitForVisible("#loading-img", 10000, true)
                .waitForVisible("#syncProvider-tab-wacs")
                .click("#syncProvider-tab-wacs")

                .waitForVisible("#wacs-credential-heading-creds > .panel-title > a")
                .click("#wacs-credential-heading-creds > .panel-title > a")

                .waitForVisible("#wacs-username")
                .setValue("#wacs-username", wacsUsername)
                .setValue("#wacs-password", wacsPassword)
                .waitForVisible("#wacs-signin")
                .click("#wacs-signin")
                .waitForVisible("#projectList , #label-no-project")
        });

        it('should create repo and upload to wacs', () => {
            return app.client.waitUntilWindowLoaded()
                .waitForVisible("#newProjectName")
                .setValue("#newProjectName", wacsRepoId)
                .click("#newProjectBtn")
                .waitForVisible(`a=${wacsRepoId}`, 5000)
                .click(`a=${wacsRepoId}`)
                .waitForVisible("a.btn-upload")
                .click("a.btn-upload")
                .waitForVisible(".swal-button--confirm", 60000)
                .click(".swal-button--confirm")
                .waitForVisible("#loading-img", 60000, true)
                .waitForVisible(".swal-title", 60000)
                .getText(".swal-title").should.eventually.equal("Book Exported")
        });

        it('should login to wacs and get projects list', () => {
            return app.client.waitUntilWindowLoaded()
                .keys('Escape')
                .waitForVisible(".swal-title", 2000, true)
                .keys('Escape')
                .waitForVisible("#tab-settings", 2000, true)

                .waitForEnabled("#btnSettings", 2000)
                .click("#btnSettings")

                .waitForVisible("#loading-img", 10000, true)
                .waitForVisible("#left-tabs-example-tab-seventh")
                .click("#left-tabs-example-tab-seventh")

                .waitForVisible("#projectList .panel-title > a", 5000)
                .getText("#projectList .panel-title > a").should.eventually.contain(wacsRepoId)
        });

        it('should select the project from the list and import', () => {
            return app.client.waitUntilWindowLoaded()
                .scroll(`a=${wacsRepoId}`)
                .click(`a=${wacsRepoId}`)
                .waitForVisible("a.btn-import")
                .click("a.btn-import")
                .waitForVisible(".swal-button--confirm", 60000)
                .click(".swal-button--confirm", 20000)
                .waitForVisible("#loading-img", 60000, true)
                .getText(".swal-title").should.eventually.equal("Import")
                .then(() =>
                    app.client
                        .click(".swal-button--confirm")
                        .waitForVisible(".swal-title", 1000, true));
        });

        it('should check the imported text', () => {
            return app.client.waitUntilWindowLoaded()
                .keys('Escape')
                .waitForVisible("#tab-settings", 2000, true)

                .keys('Tab')
                .waitForVisible("#versediv1", 20000)
                .click("#versediv1")
                .getText("#v1").should.eventually.equal(timestampedSampleText);
        });
    });
});
