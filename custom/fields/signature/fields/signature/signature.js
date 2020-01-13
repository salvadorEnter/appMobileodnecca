/*
 * Your installation or use of this SugarCRM file is subject to the applicable
 * terms available at
 * http://support.sugarcrm.com/Resources/Master_Subscription_Agreements/.
 * If you do not agree to all of the applicable terms or do not have the
 * authority to bind the entity as an authorized representative, then do not
 * install or use this SugarCRM file.
 *
 * Copyright (C) SugarCRM Inc. All rights reserved.
 */

/**
 * @sampleid signature-field
 * @samplename Signature Field
 * @sampledesc Use your finger to sign a document. Save signature image into a record.
 * @samplefeature Declaring a custom field.
 * @samplefeature Customizing a module edit view (Documents).
 * @samplefeature Rendering dynamic views.
 * @samplefeature Using a 3rd-party javascript library.
 * @samplefile edit.hbs
 * @samplefile ../../libs/signature_pad.js
 * @samplefile ../../views/edit/signature-edit.js
 * @samplefile ../../views/edit/signature-edit.hbs
 * @samplefile ../../views/edit/modules/documents-edit.js
 */

/*
 * Custom signature field type.
 */
 /*
* Created by Salvador Lopez Balleza
*/

const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const SignatureEditView = require('../../views/edit/signature-edit');
const TextField = require('%app.fields%/text-field');

// Declare 'signature' type field.
const SignatureField = customization.extend(TextField, {

    // Register DOM events handlers.
    events: {
        click: '__onTap',
    },

    __onTap(e) {
        e.stopPropagation();
        e.preventDefault();

        // Load the view dynamically (without route declaration).
        // Any data can be passed directly using 'data' property
        app.controller.loadScreen({
            isDynamic: true,
            view: SignatureEditView,
            data: {
                parentModel: this.model,
            },
        });
    },
});

customization.register(SignatureField, { metadataType: 'signature' });

module.exports = SignatureField;
