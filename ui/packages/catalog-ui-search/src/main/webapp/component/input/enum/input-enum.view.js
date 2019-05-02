const template = require('./input-enum.hbs')
const InputView = require('../input.view')
const DropdownView = require('../../dropdown/dropdown.view.js')
const moment = require('moment')
const user = require('../../singletons/user-instance.js')
const DropdownModel = require('../../dropdown/dropdown.js')

function getValue(model) {
  const multivalued = model.get('property').get('enumMulti')
  let value = model.get('value')
  if (value !== undefined && model.get('property').get('type') === 'DATE') {
    if (multivalued && value.map) {
      value = value.map(function(subvalue) {
        return user.getUserReadableDateTime(subvalue)
      })
    } else {
      value = user.getUserReadableDateTime(value)
    }
  }
  if (!multivalued) {
    value = [value]
  }
  return value
}

module.exports = InputView.extend({
  template: template,
  events: {
    'click .input-revert': 'revert',
  },
  regions: {
    enumRegion: '.enum-region',
  },
  listenForChange: function() {
    this.listenTo(
      this.enumRegion.currentView.model,
      'change:value',
      function() {
        this.model.set('value', this.getCurrentValue())
        this.validate()
      }
    )
  },
  serializeData: function() {
    const value = getValue(this.model)
    const choice = this.model
      .get('property')
      .get('enum')
      .filter(function(choice) {
        return (
          value.filter(function(subvalue) {
            return (
              JSON.stringify(choice.value) === JSON.stringify(subvalue) ||
              JSON.stringify(choice) === JSON.stringify(subvalue)
            )
          }).length > 0
        )
      })
    return {
      label: choice.length > 0 ? choice : value,
    }
  },
  onRender: function() {
    this.initializeEnum()
    InputView.prototype.onRender.call(this)
  },
  initializeEnum: function() {
    const value = getValue(this.model)
    const dropdownModel = new DropdownModel({
      value: value,
    })
    const list = this.model
      .get('property')
      .get('enum')
      .map(function(value) {
        if (value.label) {
          return {
            label: value.label,
            value: value.value,
            class: value.class,
          }
        } else {
          return {
            label: value,
            value: value,
            class: value,
          }
        }
      })
    if (this.model.get('property').get('enumCustom')) {
      list.unshift({
        label: value[0],
        value: value[0],
        filterChoice: true,
      })
    }
    this.enumRegion.show(
      DropdownView.createSimpleDropdown({
        list: list,
        model: dropdownModel,
        defaultSelection: value,
        isMultiSelect: this.model.get('property').get('enumMulti'),
        hasFiltering: this.model.get('property').get('enumFiltering'),
        filterChoice: this.model.get('property').get('enumCustom'),
        matchcase: this.model.get('property').get('matchcase'),
      })
    )
  },
  handleReadOnly: function() {
    this.$el.toggleClass('is-readOnly', this.model.isReadOnly())
  },
  handleValue: function() {
    this.enumRegion.currentView.model.set('value', getValue(this.model))
  },
  getCurrentValue: function() {
    const currentValue = this.model.get('property').get('enumMulti')
      ? this.enumRegion.currentView.model.get('value')
      : this.enumRegion.currentView.model.get('value')[0]
    switch (this.model.getCalculatedType()) {
      case 'date':
        if (currentValue) {
          return moment(currentValue).toISOString()
        } else {
          return null
        }
      default:
        return currentValue
    }
  },
  isValid: function() {
    const value = getValue(this.model)
    const choice = this.model
      .get('property')
      .get('enum')
      .filter(function(choice) {
        return (
          value.filter(function(subvalue) {
            return (
              JSON.stringify(choice.value) === JSON.stringify(subvalue) ||
              JSON.stringify(choice) === JSON.stringify(subvalue)
            )
          }).length > 0
        )
      })
    return choice.length > 0
  },
})
