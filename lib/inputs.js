"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
require("reflect-metadata");
const decorators_1 = require("./decorators");
class Inputs {
    constructor() {
        // REQUIRED ARGUMENTS
        this.AwsAccountID = '';
        this.AccessKeyID = '';
        this.SecretAccessKey = '';
        this.Region = '';
        // OPTIONAL ARGUMENTS
        this.ShouldCreateRepo = 'false';
        this.DockerfilePath = '';
        this.DockerBuildArgs = '';
        this.ProjectPath = '.';
        this.EcrRepoName = '';
        this.EcrTags = '';
        this.loadRequired();
        this.loadOptional();
    }
    loadRequired() {
        const missingInputs = [];
        for (const prop of Object.keys(this)) {
            if (decorators_1.isRequired(this, prop)) {
                const inputName = decorators_1.getInputName(this, prop);
                const value = core.getInput(inputName);
                if (value.length === 0) {
                    missingInputs.push(inputName);
                }
                if (!Reflect.set(this, prop, value)) {
                    throw new Error(`Failed to set the value of [ ${inputName} ] during action setup`);
                }
            }
        }
        if (missingInputs.length > 0) {
            throw new Error(`Missing required inputs [ ${missingInputs.join(', ')} ]. Did you set using the 'with' property?`);
        }
    }
    loadOptional() {
        for (const prop of Object.keys(this)) {
            if (decorators_1.isOptional(this, prop)) {
                const inputName = decorators_1.getInputName(this, prop);
                const value = core.getInput(inputName);
                Reflect.set(this, prop, value);
            }
        }
    }
}
__decorate([
    decorators_1.Input('account_id'),
    decorators_1.Required,
    __metadata("design:type", String)
], Inputs.prototype, "AwsAccountID", void 0);
__decorate([
    decorators_1.Input('access_key_id'),
    decorators_1.Required,
    __metadata("design:type", String)
], Inputs.prototype, "AccessKeyID", void 0);
__decorate([
    decorators_1.Input('secret_access_key'),
    decorators_1.Required,
    __metadata("design:type", String)
], Inputs.prototype, "SecretAccessKey", void 0);
__decorate([
    decorators_1.Input('region'),
    decorators_1.Required,
    __metadata("design:type", String)
], Inputs.prototype, "Region", void 0);
__decorate([
    decorators_1.Input('create_repo'),
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "ShouldCreateRepo", void 0);
__decorate([
    decorators_1.Input('dockerfile'),
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "DockerfilePath", void 0);
__decorate([
    decorators_1.Input('docker_build_args'),
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "DockerBuildArgs", void 0);
__decorate([
    decorators_1.Input('path'),
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "ProjectPath", void 0);
__decorate([
    decorators_1.Input('repo'),
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "EcrRepoName", void 0);
__decorate([
    decorators_1.Input('tags') // comma-delimited string
    ,
    decorators_1.Optional,
    __metadata("design:type", String)
], Inputs.prototype, "EcrTags", void 0);
exports.default = Inputs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2lucHV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUFzQztBQUN0Qyw0QkFBMEI7QUFDMUIsNkNBQStGO0FBRS9GLE1BQXFCLE1BQU07SUE2Q3pCO1FBNUNBLHFCQUFxQjtRQUlMLGlCQUFZLEdBQVcsRUFBRSxDQUFDO1FBSTFCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBSXpCLG9CQUFlLEdBQVcsRUFBRSxDQUFDO1FBSTdCLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFFcEMscUJBQXFCO1FBSUwscUJBQWdCLEdBQVcsT0FBTyxDQUFDO1FBSW5DLG1CQUFjLEdBQVcsRUFBRSxDQUFDO1FBSTVCLG9CQUFlLEdBQVcsRUFBRSxDQUFDO1FBSTdCLGdCQUFXLEdBQVcsR0FBRyxDQUFDO1FBSTFCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBSXpCLFlBQU8sR0FBVyxFQUFFLENBQUM7UUFHbkMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQsWUFBWTtRQUNWLE1BQU0sYUFBYSxHQUFhLEVBQUUsQ0FBQztRQUVuQyxLQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkMsSUFBSSx1QkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDMUIsTUFBTSxTQUFTLEdBQUcseUJBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXZDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3RCLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQy9CO2dCQUVELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLFNBQVMsd0JBQXdCLENBQUMsQ0FBQztpQkFDcEY7YUFDRjtTQUNGO1FBRUQsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1NBQ3BIO0lBQ0gsQ0FBQztJQUVELFlBQVk7UUFDVixLQUFJLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkMsSUFBSSx1QkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDMUIsTUFBTSxTQUFTLEdBQUcseUJBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNoQztTQUNGO0lBQ0gsQ0FBQztDQUNGO0FBN0VDO0lBRkMsa0JBQUssQ0FBQyxZQUFZLENBQUM7SUFDbkIscUJBQVE7OzRDQUNpQztBQUkxQztJQUZDLGtCQUFLLENBQUMsZUFBZSxDQUFDO0lBQ3RCLHFCQUFROzsyQ0FDZ0M7QUFJekM7SUFGQyxrQkFBSyxDQUFDLG1CQUFtQixDQUFDO0lBQzFCLHFCQUFROzsrQ0FDb0M7QUFJN0M7SUFGQyxrQkFBSyxDQUFDLFFBQVEsQ0FBQztJQUNmLHFCQUFROztzQ0FDMkI7QUFNcEM7SUFGQyxrQkFBSyxDQUFDLGFBQWEsQ0FBQztJQUNwQixxQkFBUTs7Z0RBQzBDO0FBSW5EO0lBRkMsa0JBQUssQ0FBQyxZQUFZLENBQUM7SUFDbkIscUJBQVE7OzhDQUNtQztBQUk1QztJQUZDLGtCQUFLLENBQUMsbUJBQW1CLENBQUM7SUFDMUIscUJBQVE7OytDQUNvQztBQUk3QztJQUZDLGtCQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2IscUJBQVE7OzJDQUNpQztBQUkxQztJQUZDLGtCQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2IscUJBQVE7OzJDQUNnQztBQUl6QztJQUZDLGtCQUFLLENBQUMsTUFBTSxDQUFDLENBQUMseUJBQXlCOztJQUN2QyxxQkFBUTs7dUNBQzRCO0FBM0N2Qyx5QkFrRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjb3JlIGZyb20gJ0BhY3Rpb25zL2NvcmUnO1xuaW1wb3J0ICdyZWZsZWN0LW1ldGFkYXRhJztcbmltcG9ydCB7IGdldElucHV0TmFtZSwgSW5wdXQsIGlzT3B0aW9uYWwsIGlzUmVxdWlyZWQsIE9wdGlvbmFsLCBSZXF1aXJlZCB9IGZyb20gJy4vZGVjb3JhdG9ycyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0cyB7XG4gIC8vIFJFUVVJUkVEIEFSR1VNRU5UU1xuXG4gIEBJbnB1dCgnYWNjb3VudF9pZCcpXG4gIEBSZXF1aXJlZFxuICBwdWJsaWMgcmVhZG9ubHkgQXdzQWNjb3VudElEOiBzdHJpbmcgPSAnJztcblxuICBASW5wdXQoJ2FjY2Vzc19rZXlfaWQnKVxuICBAUmVxdWlyZWRcbiAgcHVibGljIHJlYWRvbmx5IEFjY2Vzc0tleUlEOiBzdHJpbmcgPSAnJztcblxuICBASW5wdXQoJ3NlY3JldF9hY2Nlc3Nfa2V5JylcbiAgQFJlcXVpcmVkXG4gIHB1YmxpYyByZWFkb25seSBTZWNyZXRBY2Nlc3NLZXk6IHN0cmluZyA9ICcnO1xuXG4gIEBJbnB1dCgncmVnaW9uJylcbiAgQFJlcXVpcmVkXG4gIHB1YmxpYyByZWFkb25seSBSZWdpb246IHN0cmluZyA9ICcnO1xuXG4gIC8vIE9QVElPTkFMIEFSR1VNRU5UU1xuXG4gIEBJbnB1dCgnY3JlYXRlX3JlcG8nKVxuICBAT3B0aW9uYWxcbiAgcHVibGljIHJlYWRvbmx5IFNob3VsZENyZWF0ZVJlcG86IHN0cmluZyA9ICdmYWxzZSc7XG5cbiAgQElucHV0KCdkb2NrZXJmaWxlJylcbiAgQE9wdGlvbmFsXG4gIHB1YmxpYyByZWFkb25seSBEb2NrZXJmaWxlUGF0aDogc3RyaW5nID0gJyc7XG5cbiAgQElucHV0KCdkb2NrZXJfYnVpbGRfYXJncycpXG4gIEBPcHRpb25hbFxuICBwdWJsaWMgcmVhZG9ubHkgRG9ja2VyQnVpbGRBcmdzOiBzdHJpbmcgPSAnJztcblxuICBASW5wdXQoJ3BhdGgnKVxuICBAT3B0aW9uYWxcbiAgcHVibGljIHJlYWRvbmx5IFByb2plY3RQYXRoOiBzdHJpbmcgPSAnLic7XG5cbiAgQElucHV0KCdyZXBvJylcbiAgQE9wdGlvbmFsXG4gIHB1YmxpYyByZWFkb25seSBFY3JSZXBvTmFtZTogc3RyaW5nID0gJyc7XG5cbiAgQElucHV0KCd0YWdzJykgLy8gY29tbWEtZGVsaW1pdGVkIHN0cmluZ1xuICBAT3B0aW9uYWxcbiAgcHVibGljIHJlYWRvbmx5IEVjclRhZ3M6IHN0cmluZyA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubG9hZFJlcXVpcmVkKCk7XG4gICAgdGhpcy5sb2FkT3B0aW9uYWwoKTtcbiAgfVxuXG4gIGxvYWRSZXF1aXJlZCgpIHtcbiAgICBjb25zdCBtaXNzaW5nSW5wdXRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgZm9yKGNvbnN0IHByb3Agb2YgT2JqZWN0LmtleXModGhpcykpIHtcbiAgICAgIGlmIChpc1JlcXVpcmVkKHRoaXMsIHByb3ApKSB7XG4gICAgICAgIGNvbnN0IGlucHV0TmFtZSA9IGdldElucHV0TmFtZSh0aGlzLCBwcm9wKTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBjb3JlLmdldElucHV0KGlucHV0TmFtZSk7XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIG1pc3NpbmdJbnB1dHMucHVzaChpbnB1dE5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFSZWZsZWN0LnNldCh0aGlzLCBwcm9wLCB2YWx1ZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBzZXQgdGhlIHZhbHVlIG9mIFsgJHtpbnB1dE5hbWV9IF0gZHVyaW5nIGFjdGlvbiBzZXR1cGApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1pc3NpbmdJbnB1dHMubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIHJlcXVpcmVkIGlucHV0cyBbICR7bWlzc2luZ0lucHV0cy5qb2luKCcsICcpfSBdLiBEaWQgeW91IHNldCB1c2luZyB0aGUgJ3dpdGgnIHByb3BlcnR5P2ApO1xuICAgIH1cbiAgfVxuXG4gIGxvYWRPcHRpb25hbCgpIHtcbiAgICBmb3IoY29uc3QgcHJvcCBvZiBPYmplY3Qua2V5cyh0aGlzKSkge1xuICAgICAgaWYgKGlzT3B0aW9uYWwodGhpcywgcHJvcCkpIHtcbiAgICAgICAgY29uc3QgaW5wdXROYW1lID0gZ2V0SW5wdXROYW1lKHRoaXMsIHByb3ApO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGNvcmUuZ2V0SW5wdXQoaW5wdXROYW1lKTtcbiAgICAgICAgUmVmbGVjdC5zZXQodGhpcywgcHJvcCwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19