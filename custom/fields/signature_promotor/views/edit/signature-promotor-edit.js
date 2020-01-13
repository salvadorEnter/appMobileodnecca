/*
* Created by Salvador Lopez Balleza
*/
const app = SUGAR.App;
const customization = require('%app.core%/customization');

// Import third-party library.
const SignaturePad = require('../../libs/signature_pad');
const NomadView = require('%app.views%/nomad-view');

const SIGNATURE_ATTR_NAME = 'signature_promotor';

// Declare signature edit view - the view to draw a signature.
// We use base NomadView as base class.
module.exports = customization.extend(NomadView, {

    template: 'signature-promotor-edit',

    // CSS class name we want to apply to this layout's <div>.
    // The class must be defined in config/app.less
    className: 'signature-promotor-edit',

    // Declare the click handler for Clear button (see signature-edit.hbs)
    events: {
        'click .clear-canvas': '__onClear',
    },

    headerConfig: {
        title: 'Firmar Documento',
        buttons: {
            save: { label: 'Firmar' },
            cancel: true,
        },
    },

    initialize(options) {
        this._super(options);

        // 'data' property that comes in options was passed to loadScreen API when this view was loaded
        this.parentModel = options.data.parentModel;
    },

    // Override onAfterRender function to render the signature image if it's present in the model
    onAfterRender() {
        this._super();
        let canvasEl = this.$('.signature-canvas').get(0);
        let $container = this.$('.pad');
        let signatureDataUrl = this.parentModel.get(SIGNATURE_ATTR_NAME);

        canvasEl.width = $container.width();
        canvasEl.height = $container.height();

        this.signaturePad = new SignaturePad(canvasEl);

        if (signatureDataUrl) {
            let originalPixelRatio = window.devicePixelRatio;

            // Need to keep device pixel ratio equal to 1
            // To prevent unnecessary scaling in signature pad plugin.
            window.devicePixelRatio = 1;
            this.signaturePad.fromDataURL(signatureDataUrl);
            window.devicePixelRatio = originalPixelRatio;
        }
    },

    // Use onHeaderSaveClick callback to provide custom logic when a user clicks on header's Save button
    onHeaderSaveClick() {
        let signatureDataURL = this.signaturePad.isEmpty() ? '' : this.signaturePad.toDataURL();
        this.parentModel.set(SIGNATURE_ATTR_NAME, signatureDataURL);

        // Closes the view and navigates back to the record edit view.
        app.controller.goBack();
    },

    __onClear() {
        this.signaturePad.clear();
    },

    // Override _dispose handler to clean unmanaged resources to avoid memory leaks.
    _dispose() {
        if (this.signaturePad) {
            this.signaturePad.clear();
            this.signaturePad.off();
        }

        this._super();
    },
});
