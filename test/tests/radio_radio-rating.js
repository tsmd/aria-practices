const { ariaTest } = require('..');
const { By, Key } = require('selenium-webdriver');
const assertAttributeValues = require('../util/assertAttributeValues');
const assertAriaLabelExists = require('../util/assertAriaLabelExists');
const assertAriaLabelledby = require('../util/assertAriaLabelledby');
const assertAriaRoles = require('../util/assertAriaRoles');
const assertRovingTabindex = require('../util/assertRovingTabindex');
const assertTabOrder = require('../util/assertTabOrder');

const exampleFile = 'content/patterns/radio/examples/radio-rating.html';

const ex = {
  radiogroupSelector: '#ex1 [role="radiogroup"]',
  radioSelector: '#ex1 [role="radio"]',
  innerRadioSelector: '[role="radio"]',
  radiogroupSelector1: '#ex1 [role="radiogroup"]:nth-of-type(1) [role="radio"]',
};

const checkFocus = async function (t, selector, index) {
  return t.context.session.executeScript(
    function () {
      const [selector, index] = arguments;
      const items = document.querySelectorAll(selector);
      return items[index] === document.activeElement;
    },
    selector,
    index
  );
};

// Attributes

ariaTest('role="none" on SVG element', exampleFile, 'svg-none', async (t) => {
  await assertAriaRoles(t, 'ex1', 'none', '1', 'svg');
});

ariaTest(
  'role="radiogroup" on div element',
  exampleFile,
  'radiogroup-role',
  async (t) => {
    await assertAriaRoles(t, 'ex1', 'radiogroup', '1', 'div');
  }
);

ariaTest(
  '"aria-labelledby" attribute on radiogroup',
  exampleFile,
  'radiogroup-aria-labelledby',
  async (t) => {
    await assertAriaLabelledby(t, ex.radiogroupSelector);
  }
);

ariaTest('role="radio" on g elements', exampleFile, 'radio-role', async (t) => {
  await assertAriaRoles(t, 'ex1', 'radio', '5', 'g');
});

ariaTest(
  'aria-label on g[role=radio] element',
  exampleFile,
  'radio-aria-label',
  async (t) => {
    await assertAriaLabelExists(t, ex.radioSelector);
  }
);

ariaTest(
  'roving tabindex on radio elements',
  exampleFile,
  'radio-tabindex',
  async (t) => {
    // Test first radio group
    let radios =
      ex.radiogroupSelector + ':nth-of-type(1) ' + ex.innerRadioSelector;
    await assertRovingTabindex(t, radios, Key.ARROW_RIGHT);
  }
);

ariaTest(
  '"aria-checked" set on role="radio"',
  exampleFile,
  'radio-aria-checked',
  async (t) => {
    // The radio groups will be all unchecked on page load
    await assertAttributeValues(t, ex.radioSelector, 'aria-checked', 'false');

    const radiogroups = await t.context.queryElements(t, ex.radiogroupSelector);
    for (let radiogroup of radiogroups) {
      let radios = await t.context.queryElements(
        t,
        ex.innerRadioSelector,
        radiogroup
      );

      for (let checked = 0; checked < radios.length; checked++) {
        await await radios[checked].sendKeys(' ');
        for (let el = 0; el < radios.length; el++) {
          // test only one element has aria-checked="true"
          let isChecked = el === checked ? 'true' : 'false';
          t.is(
            await radios[el].getAttribute('aria-checked'),
            isChecked,
            'Tab at index ' +
              checked +
              ' is checked, therefore, tab at index ' +
              el +
              ' should have aria-checked="' +
              checked +
              '"'
          );
        }
      }
    }
  }
);

// Keys

ariaTest(
  'Moves focus to first or checked item',
  exampleFile,
  'key-tab',
  async (t) => {
    // On page load, the first item in the radio list should be in tab index
    await assertTabOrder(t, [ex.radiogroupSelector1 + ':nth-of-type(1)']);
  }
);

ariaTest('Selects radio item', exampleFile, 'key-space', async (t) => {
  const firstCrustSelector = ex.radiogroupSelector1 + ':nth-of-type(1)';
  await t.context.session.findElement(By.css(firstCrustSelector)).sendKeys(' ');
  await assertAttributeValues(t, firstCrustSelector, 'aria-checked', 'true');
});

ariaTest(
  'RIGHT ARROW changes focus and checks radio',
  exampleFile,
  'key-down-right-arrow',
  async (t) => {
    let radios = await t.context.queryElements(t, ex.radiogroupSelector1);

    // Right arrow moves focus to right
    for (let index = 0; index < radios.length - 1; index++) {
      await radios[index].sendKeys(Key.ARROW_RIGHT);
      const newIndex = index + 1;

      t.true(
        await checkFocus(t, ex.radiogroupSelector1, newIndex),
        'Focus should be on radio at index ' +
          newIndex +
          ' after ARROW_RIGHT to radio' +
          ' at index ' +
          index
      );
      t.is(
        await radios[newIndex].getAttribute('aria-checked'),
        'true',
        'Radio at index ' +
          newIndex +
          ' should be checked after ARROW_RIGHT to radio' +
          ' at index ' +
          index
      );
    }

    // Right arrow should move focus from last item to first
    await radios[radios.length - 1].sendKeys(Key.ARROW_RIGHT);
    t.true(
      await checkFocus(t, ex.radiogroupSelector1, 0),
      'Focus should be on radio at index 0 after ARROW_RIGHT to radio at index ' +
        (radios.length - 1)
    );
    t.is(
      await radios[0].getAttribute('aria-checked'),
      'true',
      'Radio at index 0 should be checked after ARROW_RIGHT to radio at index ' +
        (radios.length - 1)
    );
  }
);

ariaTest(
  'DOWN ARROW changes focus and checks radio',
  exampleFile,
  'key-down-right-arrow',
  async (t) => {
    let radios = await t.context.queryElements(t, ex.radiogroupSelector1);

    // Down arrow moves focus to down
    for (let index = 0; index < radios.length - 1; index++) {
      await radios[index].sendKeys(Key.ARROW_DOWN);
      const newIndex = index + 1;

      t.true(
        await checkFocus(t, ex.radiogroupSelector1, newIndex),
        'Focus should be on radio at index ' +
          newIndex +
          ' after ARROW_DOWN to radio' +
          ' at index ' +
          index
      );
      t.is(
        await radios[newIndex].getAttribute('aria-checked'),
        'true',
        'Radio at index ' +
          newIndex +
          ' should be checked after ARROW_DOWN to radio' +
          ' at index ' +
          index
      );
    }

    // Down arrow should move focus from last item to first
    await radios[radios.length - 1].sendKeys(Key.ARROW_DOWN);
    t.true(
      await checkFocus(t, ex.radiogroupSelector1, 0),
      'Focus should be on radio at index 0 after ARROW_DOWN to radio at index ' +
        (radios.length - 1)
    );
    t.is(
      await radios[0].getAttribute('aria-checked'),
      'true',
      'Radio at index 0 should be checked after ARROW_DOWN to radio at index ' +
        (radios.length - 1)
    );
  }
);

ariaTest(
  'LEFT ARROW changes focus and checks radio',
  exampleFile,
  'key-up-left-arrow',
  async (t) => {
    let radios = await t.context.queryElements(t, ex.radiogroupSelector1);

    // Left arrow should move focus from first item to last, then progressively left
    await radios[0].sendKeys(Key.ARROW_LEFT);

    t.true(
      await checkFocus(t, ex.radiogroupSelector1, radios.length - 1),
      'Focus should be on radio at index ' +
        (radios.length - 1) +
        ' after ARROW_LEFT to radio at index 0'
    );
    t.is(
      await radios[radios.length - 1].getAttribute('aria-checked'),
      'true',
      'Radio at index ' +
        (radios.length - 1) +
        ' should be checked after ARROW_LEFT to radio at index 0'
    );

    for (let index = radios.length - 1; index > 0; index--) {
      await radios[index].sendKeys(Key.ARROW_LEFT);
      const newIndex = index - 1;

      t.true(
        await checkFocus(t, ex.radiogroupSelector1, newIndex),
        'Focus should be on radio at index ' +
          newIndex +
          ' after ARROW_LEFT to radio' +
          ' at index ' +
          index
      );
      t.is(
        await radios[newIndex].getAttribute('aria-checked'),
        'true',
        'Radio at index ' +
          newIndex +
          ' should be checked after ARROW_LEFT to radio' +
          ' at index ' +
          index
      );
    }
  }
);

ariaTest(
  'UP ARROW changes focus and checks radio',
  exampleFile,
  'key-up-left-arrow',
  async (t) => {
    let radios = await t.context.queryElements(t, ex.radiogroupSelector1);

    // Up arrow should move focus from first item to last, then progressively up
    await radios[0].sendKeys(Key.ARROW_UP);

    t.true(
      await checkFocus(t, ex.radiogroupSelector1, radios.length - 1),
      'Focus should be on radio at index ' +
        (radios.length - 1) +
        ' after ARROW_UP to radio at index 0'
    );
    t.is(
      await radios[radios.length - 1].getAttribute('aria-checked'),
      'true',
      'Radio at index ' +
        (radios.length - 1) +
        ' should be checked after ARROW_UP to radio at index 0'
    );

    for (let index = radios.length - 1; index > 0; index--) {
      await radios[index].sendKeys(Key.ARROW_UP);
      const newIndex = index - 1;

      t.true(
        await checkFocus(t, ex.radiogroupSelector1, newIndex),
        'Focus should be on radio at index ' +
          newIndex +
          ' after ARROW_UP to radio' +
          ' at index ' +
          index
      );
      t.is(
        await radios[newIndex].getAttribute('aria-checked'),
        'true',
        'Radio at index ' +
          newIndex +
          ' should be checked after ARROW_UP to radio' +
          ' at index ' +
          index
      );
    }
  }
);
