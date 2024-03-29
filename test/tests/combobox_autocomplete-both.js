const { ariaTest } = require('..');
const { By, Key } = require('selenium-webdriver');
const assertAttributeValues = require('../util/assertAttributeValues');
const assertAriaLabelExists = require('../util/assertAriaLabelExists');
const assertAttributeDNE = require('../util/assertAttributeDNE');
const assertAriaRoles = require('../util/assertAriaRoles');
const assertAriaSelectedAndActivedescendant = require('../util/assertAriaSelectedAndActivedescendant');

const exampleFile =
  'content/patterns/combobox/examples/combobox-autocomplete-both.html';

const ex = {
  textboxSelector: '#ex1 input[type="text"]',
  listboxSelector: '#ex1 [role="listbox"]',
  optionsSelector: '#ex1 [role="option"]',
  buttonSelector: '#ex1 button',
  numAOptions: 5,
  secondAOption: 'Alaska',
};

const waitForFocusChange = async (t, textboxSelector, originalFocus) => {
  await t.context.session.wait(
    async function () {
      let newFocus = await t.context.session
        .findElement(By.css(textboxSelector))
        .getAttribute('aria-activedescendant');
      return newFocus != originalFocus;
    },
    t.context.waitTime,
    'Timeout waiting for "aria-activedescendant" value to change from: ' +
      originalFocus
  );
};

const confirmCursorIndex = async (t, selector, cursorIndex) => {
  return t.context.session.executeScript(
    function () {
      const [selector, cursorIndex] = arguments;
      let item = document.querySelector(selector);
      return item.selectionStart === cursorIndex;
    },
    selector,
    cursorIndex
  );
};

// Attributes

ariaTest(
  'Test for role="combobox"',
  exampleFile,
  'combobox-role',
  async (t) => {
    await assertAriaRoles(t, 'ex1', 'combobox', '1', 'input');
  }
);

ariaTest(
  '"aria-autocomplete" on combobox element',
  exampleFile,
  'combobox-aria-autocomplete',
  async (t) => {
    await assertAttributeValues(
      t,
      ex.textboxSelector,
      'aria-autocomplete',
      'both'
    );
  }
);

ariaTest(
  '"aria-controls" attribute on combobox element',
  exampleFile,
  'combobox-aria-controls',
  async (t) => {
    const popupId = await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .getAttribute('aria-controls');

    t.truthy(
      popupId,
      '"aria-controls" attribute should exist on: ' + ex.textboxSelector
    );

    const popupElements = await t.context.queryElements(t, `#ex1 #${popupId}`);

    t.is(
      popupElements.length,
      1,
      'There should be a element with id "' +
        popupId +
        '" as referenced by the aria-controls attribute'
    );
  }
);

ariaTest(
  '"aria-expanded" on combobox element',
  exampleFile,
  'combobox-aria-expanded',
  async (t) => {
    const combobox = await t.context.session.findElement(
      By.css(ex.textboxSelector)
    );

    // Check that aria-expanded is false and the listbox is not visible before interacting

    t.is(
      await combobox.getAttribute('aria-expanded'),
      'false',
      'combobox element should have attribute "aria-expanded" set to false by default.'
    );

    const popupId = await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .getAttribute('aria-controls');

    const popupElement = await t.context.session
      .findElement(By.id('ex1'))
      .findElement(By.id(popupId));

    t.false(
      await popupElement.isDisplayed(),
      "Popup element should not be displayed when 'aria-expanded' is false'"
    );

    // Send key "a" to textbox

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a');

    // Check that aria-expanded is true and the listbox is visible

    t.is(
      await combobox.getAttribute('aria-expanded'),
      'true',
      'combobox element should have attribute "aria-expand" set to true after typing.'
    );

    t.true(
      await popupElement.isDisplayed(),
      "Popup element should be displayed when 'aria-expanded' is true'"
    );
  }
);

ariaTest(
  '"aria-activedescendant" on combobox element',
  exampleFile,
  'combobox-aria-activedescendant',
  async (t) => {
    await assertAttributeValues(
      t,
      ex.textboxSelector,
      'aria-activedescendant',
      null
    );
  }
);

ariaTest(
  '"id" attribute on combobox element',
  exampleFile,
  'combobox-id',
  async (t) => {
    const combobox = await t.context.session.findElement(
      By.css(ex.textboxSelector)
    );
    const id = await combobox.getAttribute('id');

    t.truthy(id, '"id" attribute should exist on combobox');

    const label = await t.context.queryElements(t, `[for="${id}"]`);
    t.is(
      label.length,
      1,
      `There should be one element that labels the combobox with: [for="${id}"]`
    );
  }
);

ariaTest(
  'role "listbox" on ul element',
  exampleFile,
  'listbox-role',
  async (t) => {
    await assertAriaRoles(t, 'ex1', 'listbox', '1', 'ul');
  }
);

ariaTest(
  '"aria-label" attribute on listbox element',
  exampleFile,
  'listbox-aria-label',
  async (t) => {
    await assertAriaLabelExists(t, ex.listboxSelector);
  }
);

ariaTest(
  'role "option" on lu elements',
  exampleFile,
  'option-role',
  async (t) => {
    // Send arrow down to reveal all options
    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.ARROW_DOWN);
    await assertAriaRoles(t, 'ex1', 'option', '56', 'li');
  }
);

ariaTest(
  '"aria-selected" attribute on options element',
  exampleFile,
  'option-aria-selected',
  async (t) => {
    // Send key "a"
    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a');
    await assertAttributeValues(
      t,
      ex.optionsSelector + ':nth-of-type(1)',
      'aria-selected',
      'true'
    );
  }
);

ariaTest(
  'Button should have tabindex="-1"',
  exampleFile,
  'button-tabindex',
  async (t) => {
    const button = await t.context.session.findElement(
      By.css(ex.buttonSelector)
    );

    t.is(
      await button.getAttribute('tabindex'),
      '-1',
      'tabindex should be set to "-1" on button'
    );
  }
);

ariaTest(
  '"aria-label" attribute on button element',
  exampleFile,
  'button-aria-label',
  async (t) => {
    await assertAriaLabelExists(t, ex.buttonSelector);
  }
);

ariaTest(
  '"aria-controls" attribute on button element',
  exampleFile,
  'button-aria-controls',
  async (t) => {
    const popupId = await t.context.session
      .findElement(By.css(ex.buttonSelector))
      .getAttribute('aria-controls');

    t.truthy(
      popupId,
      '"aria-controls" attribute should exist on: ' + ex.buttonSelector
    );

    const popupElements = await t.context.queryElements(t, `#ex1 #${popupId}`);

    t.is(
      popupElements.length,
      1,
      'There should be a element with id "' +
        popupId +
        '" as referenced by the aria-controls attribute'
    );
  }
);

ariaTest(
  '"aria-expanded" on button element',
  exampleFile,
  'button-aria-expanded',
  async (t) => {
    const button = await t.context.session.findElement(
      By.css(ex.buttonSelector)
    );

    // Check that aria-expanded is false and the listbox is not visible before interacting

    t.is(
      await button.getAttribute('aria-expanded'),
      'false',
      'button element should have attribute "aria-expanded" set to false by default.'
    );

    const popupId = await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .getAttribute('aria-controls');

    const popupElement = await t.context.session
      .findElement(By.id('ex1'))
      .findElement(By.id(popupId));

    t.false(
      await popupElement.isDisplayed(),
      "Popup element should not be displayed when 'aria-expanded' is 'false'"
    );

    // Send key "a" to textbox

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a');

    // Check that aria-expanded is true and the listbox is visible

    t.is(
      await button.getAttribute('aria-expanded'),
      'true',
      'button element should have attribute "aria-expand" set to true after typing.'
    );

    t.true(
      await popupElement.isDisplayed(),
      "Popup element should be displayed when 'aria-expanded' is 'true'"
    );
  }
);

// Keys

ariaTest(
  'Test alt + down key press with focus on textbox',
  exampleFile,
  'textbox-key-alt-down-arrow',
  async (t) => {
    // Send ARROW_DOWN to the textbox
    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.ALT, Key.ARROW_DOWN);

    // Check that the listbox is displayed
    t.true(
      await t.context.session
        .findElement(By.css(ex.listboxSelector))
        .isDisplayed(),
      'In example the list box should display after ALT + ARROW_DOWN keypress'
    );

    await assertAttributeDNE(t, ex.optionsSelector, 'aria-selected');
  }
);

ariaTest(
  'Test down key press with focus on textbox',
  exampleFile,
  'textbox-key-down-arrow',
  async (t) => {
    // Send ARROW_DOWN to the textbox
    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.ARROW_DOWN);

    // Check that the listbox is displayed
    t.true(
      await t.context.session
        .findElement(By.css(ex.listboxSelector))
        .isDisplayed(),
      'In example ex3 listbox should display after ARROW_DOWN keypress'
    );

    // Account for race condition
    await waitForFocusChange(t, ex.textboxSelector, null);

    // Check that the active descendent focus is correct
    await assertAriaSelectedAndActivedescendant(
      t,
      ex.textboxSelector,
      ex.optionsSelector,
      0
    );
  }
);

ariaTest(
  'Test down key press with focus on list',
  exampleFile,
  'listbox-key-down-arrow',
  async (t) => {
    // Send 'a' to text box, then send ARROW_DOWN to textbox to set focus on listbox
    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a', Key.ARROW_DOWN);

    // Test that ARROW_DOWN moves active descendant focus on item in listbox
    for (let i = 2; i < ex.numAOptions + 1; i++) {
      let oldFocus = await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('aria-activedescendant');

      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .sendKeys(Key.ARROW_DOWN);

      // Account for race condition
      await waitForFocusChange(t, ex.textboxSelector, oldFocus);

      await assertAriaSelectedAndActivedescendant(
        t,
        ex.textboxSelector,
        ex.optionsSelector,
        i % ex.numAOptions
      );
    }
  }
);

ariaTest(
  'Test up key press with focus on textbox',
  exampleFile,
  'textbox-key-up-arrow',
  async (t) => {
    // Send ARROW_UP to the textbox
    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.ARROW_UP);

    // Check that the listbox is displayed
    t.true(
      await t.context.session
        .findElement(By.css(ex.listboxSelector))
        .isDisplayed(),
      'In example ex3 listbox should display after ARROW_UP keypress'
    );

    // Account for race condition
    await waitForFocusChange(t, ex.textboxSelector, null);

    // Check that the active descendent focus is correct
    let numOptions = (await t.context.queryElements(t, ex.optionsSelector))
      .length;
    await assertAriaSelectedAndActivedescendant(
      t,
      ex.textboxSelector,
      ex.optionsSelector,
      numOptions - 1
    );
  }
);

ariaTest(
  'Test up key press with focus on listbox',
  exampleFile,
  'listbox-key-up-arrow',
  async (t) => {
    // Send 'a' to text box, then send ARROW_UP to textbox to textbox to put focus in textbox
    // Up arrow should move selection to the last item in the list
    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a', Key.ARROW_UP);

    // Account for race condition
    await waitForFocusChange(t, ex.textboxSelector, '');
    await assertAriaSelectedAndActivedescendant(
      t,
      ex.textboxSelector,
      ex.optionsSelector,
      ex.numAOptions - 1
    );

    // Test that ARROW_UP moves active descendant focus up one item in the listbox
    for (let index = ex.numAOptions - 2; index > 0; index--) {
      let oldFocus = await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('aria-activedescendant');

      // Send Key
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .sendKeys(Key.ARROW_UP);

      await waitForFocusChange(t, ex.textboxSelector, oldFocus);

      await assertAriaSelectedAndActivedescendant(
        t,
        ex.textboxSelector,
        ex.optionsSelector,
        index
      );
    }
  }
);

ariaTest(
  'Test enter key press with focus on textbox',
  exampleFile,
  'textbox-key-enter',
  async (t) => {
    // Send key "a" to the textbox

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a');

    // Get the value of the first option in the listbox

    const firstOption = await t.context.session
      .findElement(By.css(ex.optionsSelector))
      .getText();

    // Send key ENTER

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.ENTER);

    // Confirm that the listbox is still open

    await assertAttributeValues(
      t,
      ex.textboxSelector,
      'aria-expanded',
      'false'
    );

    // Confirm that the value of the textbox is now set to the first option

    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      firstOption,
      'key press "ENTER" should result in first option in textbox'
    );
  }
);

// "Test 1" in https://github.com/w3c/aria-practices/issues/1345

ariaTest(
  'Test backspace with focus on textbox',
  exampleFile,
  'standard-single-line-editing-keys',
  async (t) => {
    // Send key "a" to the textbox

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a');

    // Get the value of the first option in the listbox

    const firstOption = await (
      await t.context.queryElements(t, ex.optionsSelector)
    )[0].getText();

    // Confirm that the value of the textbox is now set to the first option

    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      firstOption,
      'key press "a" should result in first option in textbox'
    );

    // Send key BACK_SPACE

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.BACK_SPACE);

    // Confirm that the listbox is still open

    await assertAttributeValues(t, ex.textboxSelector, 'aria-expanded', 'true');

    // Confirm that the value of the textbox is now "A"

    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      'A',
      'key press "BACK_SPACE" should result in deleting the autocompleted text'
    );

    // Send key BACK_SPACE

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.BACK_SPACE);

    // Confirm that the listbox is still open

    await assertAttributeValues(t, ex.textboxSelector, 'aria-expanded', 'true');

    // Confirm that the value of the textbox is now ""

    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      '',
      'key press "BACK_SPACE" should result in deleting the "A"'
    );

    // Send key ARROW_DOWN
    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.ARROW_DOWN);

    // Confirm that the listbox is still open

    await assertAttributeValues(t, ex.textboxSelector, 'aria-expanded', 'true');

    // Confirm aria-selected is set on the item "Alabama"

    await assertAttributeValues(
      t,
      ex.optionsSelector + ':nth-of-type(1)',
      'aria-selected',
      'true'
    );

    // Confirm that the value of the textbox is now set to the first option

    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      firstOption,
      'key press "ARROW_DOWN" should result in first option in textbox'
    );

    // Confirm that there are 56 options visible
    t.is(
      await (
        await t.context.queryElements(t, ex.optionsSelector)
      ).length,
      56,
      'key press "ARROW_DOWN" should result in all options being visible'
    );
  }
);

// "Test 2" in https://github.com/w3c/aria-practices/issues/1345

ariaTest(
  'Test backspace with focus on textbox (2)',
  exampleFile,
  'standard-single-line-editing-keys',
  async (t) => {
    // Send keys "no" to the textbox

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('n', 'o');

    // Confirm that the value of the textbox is now set to "North Carolina"

    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      'North Carolina',
      'key press "n" "o" should result in "North Carolina" in textbox'
    );

    // Send key BACK_SPACE

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.BACK_SPACE);

    // Confirm that the listbox is still open

    await assertAttributeValues(t, ex.textboxSelector, 'aria-expanded', 'true');

    // Confirm that the value of the textbox is now "No"

    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      'No',
      'key press "BACK_SPACE" should result in deleting the autocompleted text'
    );

    // Send key BACK_SPACE

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.BACK_SPACE);

    // Confirm that the listbox is still open

    await assertAttributeValues(t, ex.textboxSelector, 'aria-expanded', 'true');

    // Confirm that the value of the textbox is now "N"

    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      'N',
      'key press "BACK_SPACE" should result in deleting the "o"'
    );

    // Send key ARROW_DOWN
    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.ARROW_DOWN);

    // Confirm that the listbox is still open

    await assertAttributeValues(t, ex.textboxSelector, 'aria-expanded', 'true');

    // Confirm that the value of the textbox is now set to "Nebraska"

    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      'Nebraska',
      'key press "ARROW_DOWN" should result in "Nebraska" in textbox'
    );

    // Confirm that there are 9 options visible
    t.is(
      await (
        await t.context.queryElements(t, ex.optionsSelector)
      ).length,
      9,
      'key press "ARROW_DOWN" should result in 9 options being visible'
    );
  }
);

ariaTest(
  'Test enter key press with focus on listbox',
  exampleFile,
  'listbox-key-enter',
  async (t) => {
    // Send key "a" to the textbox, then two ARROW_DOWNS

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a', Key.ARROW_DOWN);

    // Get the value of the second option in the listbox

    const secondOption = await (
      await t.context.queryElements(t, ex.optionsSelector)
    )[1].getText();

    // Send key ENTER

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys(Key.ENTER);

    // Confirm that the listbox is closed

    await assertAttributeValues(
      t,
      ex.textboxSelector,
      'aria-expanded',
      'false'
    );

    // Confirm that the value of the textbox is now set to the second option

    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      secondOption,
      'key press "ENTER" should result in second option in textbox'
    );
  }
);

ariaTest(
  'Test single escape key press with focus on textbox',
  exampleFile,
  'textbox-key-escape',
  async (t) => {
    // Send key "a", then key ESCAPE once to the textbox

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a', Key.ESCAPE);

    // Confirm the listbox is closed and the textbox is not cleared

    await assertAttributeValues(
      t,
      ex.textboxSelector,
      'aria-expanded',
      'false'
    );
    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      'Alabama',
      'In key press "ESCAPE" should result in first option in textbox'
    );
  }
);

ariaTest(
  'Test double escape key press with focus on textbox',
  exampleFile,
  'textbox-key-escape',
  async (t) => {
    // Send key "a", then key ESCAPE twice to the textbox

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a', Key.ESCAPE, Key.ESCAPE);

    // Confirm the listbox is closed and the textbox is cleared

    await assertAttributeValues(
      t,
      ex.textboxSelector,
      'aria-expanded',
      'false'
    );
    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      '',
      'In key press "ESCAPE" should result in first option in textbox'
    );
  }
);

ariaTest(
  'Test escape key press with focus on textbox',
  exampleFile,
  'listbox-key-escape',
  async (t) => {
    // Send key "a" then key "ARROW_DOWN to put the focus on the listbox,
    // then key ESCAPE to the textbox

    await t.context.session
      .findElement(By.css(ex.textboxSelector))
      .sendKeys('a', Key.ARROW_DOWN, Key.ESCAPE);

    // Confirm the listbox is closed and the textbox is cleared

    await assertAttributeValues(
      t,
      ex.textboxSelector,
      'aria-expanded',
      'false'
    );
    t.is(
      await t.context.session
        .findElement(By.css(ex.textboxSelector))
        .getAttribute('value'),
      ex.secondAOption,
      'In listbox key press "ESCAPE" should result in second option in textbox'
    );
  }
);

ariaTest(
  'left arrow from focus on list puts focus on listbox and moves cursor right',
  exampleFile,
  'listbox-key-left-arrow',
  async (t) => {
    // Send key "a" then key "ARROW_DOWN" to put the focus on the listbox
    const textbox = await t.context.session.findElement(
      By.css(ex.textboxSelector)
    );
    await textbox.sendKeys('a', Key.ARROW_DOWN);

    // Send key "ARROW_LEFT"
    await textbox.sendKeys(Key.ARROW_LEFT);

    t.true(
      await confirmCursorIndex(
        t,
        ex.textboxSelector,
        ex.secondAOption.length - 1
      ),
      'Cursor should be at index ' +
        (ex.secondAOption.length - 1) +
        ' after one ARROW_LEFT key'
    );

    t.is(
      await textbox.getAttribute('aria-activedescendant'),
      '',
      'Focus should be on the textbox after on ARROW_LEFT key'
    );
  }
);

ariaTest(
  'Right arrow from focus on list puts focus on listbox',
  exampleFile,
  'listbox-key-right-arrow',
  async (t) => {
    // Send key "a" then key "ARROW_DOWN" to put the focus on the listbox
    const textbox = await t.context.session.findElement(
      By.css(ex.textboxSelector)
    );
    await textbox.sendKeys('a', Key.ARROW_DOWN);

    // Send key "RIGHT_ARROW"
    await textbox.sendKeys(Key.ARROW_RIGHT);

    t.true(
      await confirmCursorIndex(t, ex.textboxSelector, ex.secondAOption.length),
      'Cursor should be at index ' +
        ex.secondAOption.length +
        ' after one ARROW_RIGHT key'
    );

    t.is(
      await textbox.getAttribute('aria-activedescendant'),
      '',
      'Focus should be on the textbox after on ARROW_RIGHT key'
    );
  }
);

ariaTest(
  'Home from focus on list puts focus on listbox and moves cursor',
  exampleFile,
  'listbox-key-home',
  async (t) => {
    // Send key "a" then key "ARROW_DOWN" to put the focus on the listbox
    const textbox = await t.context.session.findElement(
      By.css(ex.textboxSelector)
    );
    await textbox.sendKeys('a', Key.ARROW_DOWN);

    // Send key "ARROW_HOME"
    await textbox.sendKeys(Key.HOME);

    t.true(
      await confirmCursorIndex(t, ex.textboxSelector, 0),
      'Cursor should be at index 0 after one ARROW_HOME key'
    );

    t.is(
      await textbox.getAttribute('aria-activedescendant'),
      '',
      'Focus should be on the textbox after one ARROW_HOME key'
    );
  }
);

ariaTest(
  'End from focus on list puts focus on listbox',
  exampleFile,
  'listbox-key-end',
  async (t) => {
    // Send key "a" then key "ARROW_DOWN" to put the focus on the listbox
    const textbox = await t.context.session.findElement(
      By.css(ex.textboxSelector)
    );
    await textbox.sendKeys('a', Key.ARROW_DOWN);

    // Send key "END_ARROW"
    await textbox.sendKeys(Key.END);

    t.true(
      await confirmCursorIndex(t, ex.textboxSelector, ex.secondAOption.length),
      'Cursor should be at index ' +
        ex.secondAOption.length +
        ' after one ARROW_END key'
    );

    t.is(
      await textbox.getAttribute('aria-activedescendant'),
      '',
      'Focus should be on the textbox after on ARROW_END key'
    );
  }
);

ariaTest(
  'Sending character keys while focus is on listbox moves focus',
  exampleFile,
  'listbox-characters',
  async (t) => {
    // Send key "ARROW_DOWN" to put the focus on the listbox
    const textbox = await t.context.session.findElement(
      By.css(ex.textboxSelector)
    );
    await textbox.sendKeys(Key.ARROW_DOWN);

    // Send key "a"
    await textbox.sendKeys('a');

    // Get the value of the first option in the listbox
    const firstOption = await t.context.session
      .findElement(By.css(ex.optionsSelector))
      .getText();

    t.is(
      await textbox.getAttribute('value'),
      firstOption + 'a',
      'Value of the textbox should be "a" after sending key "a" to the textbox while the focus ' +
        'is on the listbox'
    );

    t.is(
      await textbox.getAttribute('aria-activedescendant'),
      '',
      'Focus should be on the textbox after sending a character key while the focus is on the listbox'
    );
  }
);

ariaTest(
  'Expected behavior for all other standard single line editing keys',
  exampleFile,
  'standard-single-line-editing-keys',
  async (t) => {
    // Send key "a"
    const textbox = await t.context.session.findElement(
      By.css(ex.textboxSelector)
    );
    await textbox.sendKeys('a');

    t.is(
      (await t.context.queryElements(t, ex.optionsSelector)).length,
      ex.numAOptions,
      'Sending standard editing keys should filter results'
    );
  }
);
