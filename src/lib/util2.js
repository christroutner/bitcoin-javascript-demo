/*
  Utility library
*/

class BitcoinUtil {
  base64encode(str) {
      try {
          if (typeof window !== 'undefined' && window.atob) {
              return window.btoa(str).replace(/[=]/g, '');
          }

          return Buffer.from(str, 'utf8').toString('base64').replace(/[=]/g, '');
      } catch (err) {
          throw new Error(`Can not encode string: ${ JSON.stringify(str) }:\n\n${ err.stack }`);
      }
  }

  base64decode(str) {
      try {
          if (typeof window !== 'undefined' && window.btoa) {
              return window.atob(str);
          }

          return Buffer.from(str, 'base64').toString('utf8');
      } catch (err) {
          throw new Error(`Can not decode string: ${ JSON.stringify(str) }:\n\n${ err.stack }`);
      }
  }

  arrayBufferToString(buf) {
      return String.fromCharCode.apply(null, new Uint16Array(buf));
  }

  stringToArrayBuffer(str) {
      const buf = new ArrayBuffer(str.length*2);
      const bufView = new Uint16Array(buf);
      for (let i=0, strLen=str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
      }
      return buf;
  }

  arrayBufferToBase64(buffer) {
      var binary = '';
      var bytes = new Uint8Array( buffer );
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return this.base64encode( binary );
  }

  base64ToArrayBuffer(base64) {
      var binary_string =  this.base64decode(base64);
      var len = binary_string.length;
      var bytes = new Uint8Array( len );
      for (var i = 0; i < len; i++)        {
          bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
  }

  uniqueID() {

      const chars = '0123456789abcdef';

      const randomID = 'xxxxxxxxxx'.replace(/./g, () => {
          return chars.charAt(Math.floor(Math.random() * chars.length));
      });

      return randomID;
  }

  async delay(time) {
      return await new Promise(resolve => setTimeout(resolve, time));
  }

  async loop(handler, time=500) {
      while (true) {
          await this.delay(time);
          handler();
      }
  }

  count(str, substr) {
      const match = str.match(new RegExp(substr, 'gi'));
      const len = match ? match.length : 0;
      return len;
  }

  sort(arr, predicate) {
      return [ ...arr ].sort((a, b) => {
          return predicate(a, b) ? 1 : -1;
      });
  }

  sortBy(arr, getter) {
      return this.sort(arr, (a, b) => (getter(a) > getter(b)))
  }

  safeJSONStringify(item) {
      const result = JSON.stringify(item);

      if (typeof result === 'undefined') {
          throw new Error(`Can not JSON.stringify undefined`);
      }

      return result;
  }

  async asyncMap(arr, mapper) {
      return await Promise.all(arr.map(mapper));
  }

  async asyncFilter(arr, filterer) {
      return await Promise.all(arr.map((val, index) => {
          return Promise.resolve(filterer(val)).then(include => {
              return [ val, include ];
          })
      })).then(results => {
          return results.filter(([ val, include ]) => {
              return include;
          }).map(([ val, include ]) => {
              return val;
          })
      });
  }

  randomEntry(arr) {
      return arr[Math.floor(Math.random() * arr.length)]
  }

  divisibleBy(num, divisor, base = 36) {
      if (typeof num === 'string') {
          num = parseInt(num, base);
      }

      return (num % divisor) === 0;
  }

  now() {
      return Date.now();
  }
}


class Counter {
    // $key: string;
    // $value: number;

    add(key, num) {
        this[key] = this[key] || 0;
        this[key] += num;
    }

    subtract(key, num) {
        this[key] = this[key] || 0;
        this[key] -= num;
    }
}

module.exports = { BitcoinUtil, Counter }
