import { expect, spy } from 'chai';

import { runMiddlewares, delay, filterBySameHost } from '../src/crawler.js';

describe('crawler', () => {

  describe('#delay', () => {

    it('should delay and pass args back', async () => {
      const url = 'http://hostname/pathname';
      const delayFunc = delay(0, 0);
      const result = await delayFunc(url);
      expect(url).to.be.equal(result);
    });

  });

  describe('#runMiddlewares', () => {

    it('should run through each middlewares', async () => {
      const url = 'http://hostname/pathname';
      const doSomething = spy(arg => arg);
      const doAnotherThing = spy(arg => arg);
      const doMoreThing = spy(arg => arg);
      const middlewares = [
        doSomething,
        doAnotherThing,
        doMoreThing
      ];

      const result = await runMiddlewares(url, ...middlewares);

      expect(result).to.be.equal(url);
      expect(doSomething).to.have.been.called.once.with(url);
      expect(doAnotherThing).to.have.been.called.once.with(url);
      expect(doMoreThing).to.have.been.called.once.with(url);
    });

    it('should be rejected with some rejected middleware', async () => {
      const url = 'http://hostname/pathname';
      const doSomething = spy(arg => arg);
      const doSomethingWrong = spy(() => Promise.reject('wrong'));
      const doMoreThing = spy(arg => arg);
      const middlewares = [
        doSomething,
        doSomethingWrong,
        doMoreThing
      ];

      await expect(runMiddlewares(url, ...middlewares)).to.be.rejectedWith('wrong');
      expect(doSomething).to.have.been.called.once.with(url);
      expect(doSomethingWrong).to.have.been.called.once.with(url);
      expect(doMoreThing).to.have.not.been.called();
    });

    it('should pass modify data along middlewares', async () => {
      const url = 'http://hostname/pathname';
      const modifyUrl = 'http://other-host/pathname';
      const doSomething = spy(arg => arg);
      const doModify = spy(() => modifyUrl);
      const doMoreThing = spy(arg => arg);
      const middlewares = [
        doSomething,
        doModify,
        doMoreThing
      ];

      const result = await runMiddlewares(url, ...middlewares);

      expect(doSomething).to.have.been.called.once.with(url);
      expect(doModify).to.have.been.called.once.with(url);
      expect(doMoreThing).to.have.been.called.with(modifyUrl);
      expect(result).to.be.equal(modifyUrl);
    });

  });

  describe('#filterBySameHost', () => {

    it('should keep urls with the same host', () => {
      const remains = filterBySameHost({ host: 'host' }, [
        { host: 'host', path: 'under-host' },
        { host: 'others', path: 'other' },
        { path: 'relative-update-host' }
      ]);

      expect(remains).to.be.deep.equal([
        { host: 'host', path: 'under-host' },
        { path: 'relative-update-host' }
      ]);
    });

    it('should also take non-array variables', () => {
      const remains = filterBySameHost({ host: 'host' },
        { host: 'host', path: 'under-host' },
        { host: 'others', path: 'other' },
        { path: 'relative-update-host' }
      );

      expect(remains).to.be.deep.equal([
        { host: 'host', path: 'under-host' },
        { path: 'relative-update-host' }
      ]);
    });

  });

});
