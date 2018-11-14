/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
/* global setTimeout */
const SearchFormViews = require('../search-form/search-form.view.js')
const properties = require('../../js/properties.js')
const lightboxResultInstance = require('../lightbox/result/lightbox.result.view.js')
const lightboxInstance = lightboxResultInstance.generateNewLightbox()
const QueryResult = require('./result-form.view.js')
const SearchFormModel = require('../search-form/search-form.js')
const CustomElements = require('../../js/CustomElements.js')
const user = require('../singletons/user-instance')
const announcement = require('../announcement')

module.exports = SearchFormViews.extend({
  initialize: function() {
    SearchFormViews.prototype.initialize.call(this)
  },
  changeView: function() {
    if (
      this.model.get('type') !== 'new-result' &&
      !user.canWrite({
        owner: this.model.get('owner'),
        accessGroups: this.model.get('accessGroups'),
        accessIndividuals: this.model.get('accessIndividuals'),
        accessAdministrators: this.model.get('accessAdministrators'),
      })
    ) {
      announcement.announce(
        {
          title: 'Error',
          message:
            'You have read-only permission on result form ' +
            this.model.get('name') +
            '.',
          type: 'error',
        },
        3000
      )
      return
    }

    lightboxInstance.model.updateTitle(
      this.model.get('type') === 'new-result' ? '' : this.model.get('name')
    )
    lightboxInstance.model.open()
    lightboxInstance.showContent(
      new QueryResult({
        model:
          this.model.get('type') === 'new-result'
            ? new SearchFormModel({ name: '' })
            : this.model,
      })
    )
  },
})
