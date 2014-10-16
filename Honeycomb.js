//Author-
//Description-
/*globals adsk*/
(function () {

    "use strict";

    if (adsk.debug === true) {
        /*jslint debug: true*/
        debugger;
        /*jslint debug: false*/
    }
 
    var app = adsk.core.Application.get(), ui;
    if (app) {
        ui = app.userInterface;
    }

    // Create the command definition.
    var createCommandDefinition = function() {
        var commandDefinitions = ui.commandDefinitions;
        
        // Be fault tolerant in case the command is already added...
        var cmDef = commandDefinitions.itemById('Honeycomb');
        if (!cmDef) {
            var url = window.location.pathname;
            var des = decodeURI(url);
            
            //remove the / at beginning
            var semicolonIndex = des.indexOf(":");
            //It's a path on Windows
            if(semicolonIndex != -1) {
                des = des.substr(1);
            }
            var index = des.lastIndexOf('.');
            var dir = des.substring(0, index);
            cmDef = commandDefinitions.addButtonDefinition('Honeycomb', 
                    'Create a honeycomb structure', 
                    'Create a honeycomb structure.',
                    dir);
        }
        return cmDef;
    };

    // CommandCreated event handler.
    var onCommandCreated = function(args) {
        try {
            // Connect to the CommandExecuted event.
            var command = args.command;
            command.execute.add(onCommandExecuted);        

            // Terminate the script when the command is destroyed
            command.destroy.add(function () { adsk.terminate(); });

            // Define the inputs.
            var inputs = command.commandInputs;

            inputs.addSelectionInput('profile', 'Sketch profile', 'Select the bounding sketch profile');

            var initialVal3 = adsk.core.ValueInput.createByReal(5.0);
            inputs.addValueInput('radius', 'Radius', 'mm' , initialVal3);

            var initialVal = adsk.core.ValueInput.createByReal(2.0);
            inputs.addValueInput('spacing', 'Spacing', 'mm' , initialVal);

            var initialVal2 = adsk.core.ValueInput.createByReal(5.0);
            inputs.addValueInput('perimeterSpacing', 'Perimeter spacing', 'mm' , initialVal2);

            inputs.addBoolValueInput('cutComb', 'Press/pull the honeycomb', 'Press/pull');
        } 
        catch (e) {
            ui.messageBox('Failed to create command : ' + (e.description ? e.description : e));
        }
    };

    
        // CommandExecuted event handler.
    var onCommandExecuted = function(args) {
        try {
            var unitsMgr = app.activeProduct.unitsManager;
            var command = adsk.core.Command(args.firingEvent.sender);
            var inputs = command.commandInputs;

            var profileInput;
            var radiusInput;
            var spacingInput;
            var perimeterSpacingInput;
            var cutCombInput;

            // Problem with a problem - the inputs are empty at this point. We
            // need access to the inputs within a command during the execute.
            for (var n = 0; n < inputs.count; n++) {
                var input = inputs.item(n);
                if (input.id === 'profile') {
                    profileInput = adsk.core.SelectionCommandInput(input);
                    profileInput.addSelectionFilter(adsk.core.SelectionCommandInput.SketchCurves);
                }
                else if (input.id === 'radius') {
                    radiusInput = adsk.core.ValueCommandInput(input);
                }
                else if (input.id === 'spacing') {
                    spacingInput = adsk.core.ValueCommandInput(input);
                }
                else if (input.id === 'perimeterSpacing') {
                    perimeterSpacingInput = adsk.core.ValueCommandInput(input);
                }
                else if (input.id === 'cutComb') {
                    cutCombInput = adsk.core.StringValueCommandInput(input);
                }
            }

            var profile;
            var radius;
            var spacing;
            var perimeterSpacing;
            var cutComb;

            if (!profileInput || !radiusInput || !spacingInput || !perimeterSpacingInput || !cutCombInput) {
                ui.messageBox("One of the inputs don't exist.");

                profile = null;
                radius = 5.0;
                spacing = 2.0;
                perimeterSpacing = 5.0;
                cutComb = true;
            }
            else
            {
                //profile = ??;
                radius = unitsMgr.evaluateExpression(radiusInput.expression, "mm");
                spacing = unitsMgr.evaluateExpression(spacingInput.expression, "mm");
                perimeterSpacing = unitsMgr.evaluateExpression(perimeterSpacingInput.expression, "mm");
                cutComb = unitsMgr.evaluateExpression(cutCombInput);
            }

        } 
        catch (e) {        
            ui.messageBox('Failed to create honeycomb : ' + (e.description ? e.description : e));
        }
    };

    
    try {
        var command = createCommandDefinition();
        var commandCreatedEvent = command.commandCreated;
        commandCreatedEvent.add(onCommandCreated);
        command.execute();

    } 
    catch (e) {
        if (ui) {
            ui.messageBox('Failed : ' + (e.description ? e.description : e));
        }
    } 
 
    adsk.terminate();
}());
