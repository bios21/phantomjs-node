import proxyquire from "proxyquire";
import child_process from "child_process";
import phantomjs from "phantomjs-prebuilt";
import Phantom from "../phantom";
import path from "path";
import Page from "../page";


describe('Phantom', () => {
    let instance;
    beforeAll(() => instance = new Phantom());
    afterAll(() => instance.exit());

    it('#createPage() returns a Promise', () => {
        expect(instance.createPage()).toEqual(jasmine.any(Promise));
    });

    it('#createPage() resolves to a Page', (done) => {
        instance.createPage().then((page) => {
            expect(page).toEqual(jasmine.any(Page));
            done();
        });
    });

    it('#create([], {}) execute with no parameters', () => {
        spyOn(child_process, 'spawn').and.callThrough();
        let ProxyPhantom = proxyquire('../phantom', {
            child_process: child_process
        }).default;

        let pp = new ProxyPhantom();
        let pathToShim = path.normalize(__dirname + '/../shim.js');
        expect(child_process.spawn).toHaveBeenCalledWith(phantomjs.path, [pathToShim]);
        pp.exit();
    });

    it('#create(["--ignore-ssl-errors=yes"]) adds parameter to process', () => {
        spyOn(child_process, 'spawn').and.callThrough();
        let ProxyPhantom = proxyquire('../phantom', {
            child_process: child_process
        }).default;
        let pp = new ProxyPhantom(['--ignore-ssl-errors=yes']);
        let pathToShim = path.normalize(__dirname + '/../shim.js');
        expect(child_process.spawn).toHaveBeenCalledWith(phantomjs.path, ['--ignore-ssl-errors=yes', pathToShim]);
        pp.exit();
    });

    it('#create([], {phantomPath: \'phantomjs\'}) execute phantomjs from custom path with no parameters', () => {
        spyOn(child_process, 'spawn').and.callThrough();
        let ProxyPhantom = proxyquire('../phantom', {
            child_process: child_process
        }).default;

        let pp = new ProxyPhantom([], {phantomPath: 'phantomjs'});
        let pathToShim = path.normalize(__dirname + '/../shim.js');
        expect(child_process.spawn).toHaveBeenCalledWith('phantomjs', [pathToShim]);
        pp.exit();
    });

    it('#create("--ignore-ssl-errors=yes") to throw an exception', () => {
        expect(() => new Phantom('--ignore-ssl-errors=yes')).toThrow();
    });

    it('#create(true) to throw an exception', () => {
        expect(() => new Phantom(true)).toThrow();
    });

    it('#create([], "/path/to/phantomjs") to throw an exception', () => {
        expect(() => new Phantom([], "/path/to/phantomjs")).toThrow();
    });

    it('catches errors when stdin closes unexpectedly', (done) => {
        instance.process.stdin.end();
        instance.createPage().catch((err) => {
            if (err.message.includes('Error reading from stdin')) {
                done();
            } else {
                done(new Error('Wrong error message'));
            }
        });
    });

    it('catches errors when stdout closes unexpectedly', (done) => {
        instance.process.stdout.end();
        instance.createPage().catch((err) => {
            if (err.message.includes('Error reading from stdout')) {
                done();
            } else {
                done(new Error('Wrong error message'));
            }
        });
    });
});
