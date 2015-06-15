'use strict';

angular.module('angular-walkthrough')
.controller('WalkThroughController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    var self = this;
    self.activeStep = null;
    self.registeredSteps = {};

    // public
    self.start = function (group) {
    	console.log('start: ' + group);
        $scope._addOverlayLayer();
        self._showNextStep(1, group);
    }
    self.next = function () { self._showNextStep(); }
    self.prev = function () { self._showPreviousStep(); }
    self.cancel = function () {
        $scope._removeOverlayLayer();
        if (self.activeStep) {
            self.activeStep.hide().then(function () {
                self.activeStep = undefined;
                $rootScope.$emit('wt:finish');
            });
        }
    }
    self.active = function () {
        return (self.activeStep ? true : false);
    }

    self._registerStep = function (step) {
        if (self.registeredSteps[step.group] && self.registeredSteps[step.group][step.step]) {
            console.log('Step Number ' + step.step + ' has already been registered for group ' + step.group + ', you can\'t have two steps in the same group with the same step number.');
        }
        if (!self.registeredSteps[step.group]) self.registeredSteps[step.group] = {};
        self.registeredSteps[step.group][step.step] = step;
    }
    //
    // can be used to start the walkthrough, go to the next step, or jump to a step
    //
    // if step provided, show that step,
    // otherwise, if active step, show next if exists
    self._showNextStep = function (step, group) {
        function showNext(ns, ng) {
            self.activeStep = self.registeredSteps[ng][ns];
            self.activeStep.show();
        }
        var nextStep = step || (self.activeStep ? self.activeStep.step + 1 : 1);
        var nextGroup = group || (self.activeStep ? self.activeStep.group : 'default');
        if (self.registeredSteps[nextGroup] && self.registeredSteps[nextGroup][nextStep]) {
            if (self.activeStep) {
                self.activeStep.hide().then(function () {
                    showNext(nextStep, nextGroup);
                });
            } else {
                showNext(nextStep, nextGroup);
            }
        } else {
            self.cancel();
        }
    }
    self._showPreviousStep = function () {
        if (self.activeStep && self.registeredSteps[self.activeStep.group][self.activeStep.step - 1]) {
            self._showNextStep(self.activeStep.step - 1);
        }
    }
    self._getNumSteps = function (group) {
        group = group || 'default';
        return Object.keys(self.registeredSteps[group]).length;
    }
    self._addHelperLayer = function (element) { $scope._addHelperLayer(element); }
    self._removeHelperLayer = function () { $scope._removeHelperLayer(); }
    self._addCoverLayer = function (element) { $scope._addCoverLayer(element); }
    self._removeCoverLayer = function () { $scope._removeCoverLayer(); }
}]);