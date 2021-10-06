import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating';
import { Tasks } from '../api/tasks';
import { ReactiveDict } from 'meteor/reactive-dict'

import './task.js'
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict()
    Meteor.subscribe('tasks')
})


Template.body.helpers({
    tasks() {
        const instance = Template.instance()
        if (instance.state.get('hideCompleted')) {
            //IF HIDE COMPLETED IS CHECKED,FILTER TASKS
            return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } })
        }
        //OTHERWISE RETURN ALL TASKS
        //SHOW NEWEST TASK AT THE TOP 
        return Tasks.find({}, { sort: { createdAt: -1 } })
    },
    incompleteCount() {
        return Tasks.find({ checked: { $ne: true } }).count()
    },
})

Template.body.events({
    'submit .new-task'(event) {
        //PREVENT DEFAULT BROWSER FROM SUBMIT
        event.preventDefault()

        //GET VALUE FROM THE FORM
        const target = event.target
        const text = target.text.value

        //INSERT TASK TO THE COLLECTION
        Meteor.call('tasks.insert', text)

        //CLEAR THE FORM
        target.text.value = ""
    },
    'change .hide-completed input'(event, instance) {
        instance.state.set('hideCompleted', event.target.checked)
    },
})

