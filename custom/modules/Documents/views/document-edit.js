/*
* Created by Salvador Lopez Balleza
*/
const customization = require('%app.core%/customization.js');
const EditView = require('%app.views.edit%/edit-view.js');

const DocumentEditView = customization.extend(EditView, {

    initialize(options) {
        this._super(options);

        this.model.on('data:sync:complete', this.showSignatureClient,this); 
        
    },

    showSignatureClient:function(){

        if(!this.model.get('tct13_tipodocumentos_documents_name').includes('KYC')){
        	//Ocultar campo para firma de cliente
        	$('.signature_cliente').hide();

        }

    }
});

customization.register(DocumentEditView, { module: 'Documents' });

module.exports = DocumentEditView;
