<template>
  <div class="padding-10">
    <div class="fcolumn">
      <div class="notification" @click="hideNotification" v-if="hasNotification" :class="notificationType">
        {{notificationText}}
      </div>

      <div class="frow title">
        <img src="../images/api.svg">
        <p class="padding-left-10 flex grow">{{projectTitle}}</p>
      </div>
      <div class="tabs">
        <ul>
          <li :class="{'is-active': isEditor}"><a @click="setIsEditor(true)">Editor</a></li>
          <li :class="{'is-active': !isEditor}"><a @click="setIsEditor(false)">JSON</a></li>
        </ul>
      </div>
      <pre v-if="!isEditor">{{formatted}}</pre>
      <form  v-else class="padding-top-10" @submit.prevent>
        <div class="field">
          <div class="control">
            <input class="input" type="text" placeholder="Project name" v-model="projectName">
            <p class="help is-info">Lower case no spaces</p>
            <p class="help is-info" v-if="shouldShowProjectNameFiltered">Your new project will be created as <strong>{{projectNameFiltered}}</strong></p>
            <p class="help is-info">{{projectUUID}}</p>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <textarea class="textarea" type="text" placeholder="Project description" v-model="projectDescription"></textarea>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <label class="checkbox">
              <input type="checkbox" @change="addRemoveAuth" v-model="useAuth">
              Add authentication?
            </label>
          </div>
        </div>
        <p v-if="!hasModels" class="field margin-top-10">No models yet</p>
        <p v-else class="field margin-top-10">Models</p>
        <div class="border-bottom padding-bottom-10 padding-top-5" v-for="model in models">
          <div class="field">
            <div class="control">
              <input class="input" type="text" :readonly="model.auth" placeholder="Model name" v-model="model.name">
            </div>
            <p class="help is-info" v-if="model.auth">Authentication model is handled by Dyno</p>
            <p class="help is-info" v-else>Singular, camelCase</p>
          </div>
          <template v-if="useAuth && model.auth">
            <div class="field">
              <div class="control">
                <input class="input" type="text" placeholder="GitHub App Client Id" v-model="clientId">
              </div>
              <p class="help is-info" v-if="model.auth">Go to <a href="https://github.com/settings/apps" target="_blank">GitHub Apps</a> and create an app!<br/>Uncheck Webhook: Active.<br/>Enter your app client id here</p>
            </div>
            <div class="field">
              <div class="control">
                <input class="input" type="text" placeholder="GitHub App Client Secret" v-model="clientSecret">
              </div>
              <p class="help is-info">Enter your app client secret here</p>
            </div>
          </template>
          <div>
            <p v-if="!hasProperties(model) && !model.auth" class="field">{{emptyPropertyMessage(model)}}</p>
            <p v-else-if="!model.auth" class="field">
              {{model.name}} Properties
            </p>
            <template v-for="property in model.properties">
              <div class="field is-grouped">
                <div class="control is-expanded">
                  <input class="input" type="text" placeholder="Property name" v-model="property.name">
                </div>
                <div class="control">
                  <div class="select">
                    <select v-model="property.type">
                      <option value="string">String</option>
                      <option value="email">Email</option>
                      <option value="integer">Integer</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                </div>
              </div>
              <p class="help is-info">Lower case no spaces</p>
              <div class="field is-grouped">
                <div class="control">
                  <label class="checkbox">
                    <input type="checkbox" v-model="property.unique">
                    Unique
                  </label>
                </div>
                <div class="control">
                  <label class="checkbox">
                    <input type="checkbox" v-model="property.nullable">
                    Nullable
                  </label>
                </div>
              </div>
              <div class="field">
                <div class="control">
                  <label class="checkbox">
                    <a class="button is-small is-text" @click="removeProperty(model, property)">Remove {{property.name}} property</a>
                  </label>
                </div>
              </div>
            </template>
            <div class="field">
              <div class="control">
                <button class="button" @click="addProperty(model)" v-if="!model.auth">Add {{model.name}} properties</button>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="checkbox">
                  <a class="button is-small is-text" @click="removeModel(model)">Remove {{model.name}} model</a>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="field margin-top-10">
          <div class="control">
            <button class="button" @click="addModel">Add model</button>
          </div>
        </div>

        <div class="field">
          <div class="control">
            <button class="button is-link" :disabled="creating" @click="createProject">Create Project</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import { createProject, createSchema } from "../services/project-service";
import { lowerCaseNoSpecialChars, camelToSnakeCase } from "../utils/regexes.js";
export default {
  data() {
    return {
      creating: false,
      notificationText: "",
      hasNotification: false,
      notificationType: {'is-info': true, 'is-danger': false},
      useAuth: false,
      isEditor: true,
      projectName: "",
      projectNameFiltered: "",
      projectUUID: "",
      projectDescription: "",
      models: [],
      idCount: 0,
      clientId: "",
      clientSecret: "",
    }
  },
  methods: {
    incrementId() {
      this.idCount += 1;
    },
    decrementId() {
      this.idCount -= 1;
    },
    addModel() {
      this.models.push({
        name: "",
        properties: [],
        id: this.idCount,
      });
      this.incrementId();
    },

    addProperty(model) {
      model.properties.push({
        name: "",
        type: "string",
        nullable: false,
        unique: false,
        id: this.idCount,
      });
      this.incrementId();
    },

    addRemoveAuth(e) {
      if(e.target.checked) {
        this.models.unshift({
          "name": "user",
          "auth": true,
          "provider": "Github",
          "associations": [],
          "authorize": [],
          "scope": {},
          "selectables": [],
          "id": this.idCount,
        });
        this.incrementId();
      } else {
        this.models.splice(
          this.models.findIndex(
            m => m.name === "user"
          ),
        1);
        this.decrementId();
      }
    },

    removeModel(model) {
      if(model.name === "user") {
        this.useAuth = false; 
      }
      this.models.splice(
        this.models.findIndex(
          m => m.id === model.id
        )
      );
    },

    removeProperty(model, property) {
      model.properties.splice(
        model.properties.findIndex(
          p => p.id === property.id
        )
      );
    },

    setIsEditor(isEditor) {
      this.isEditor = isEditor;
    },

    hideNotification() {
      this.hasNotification = false;
    },

    async createProject() {
      let project;
      let schema;
      this.creating = true;
      try{
        project = await createProject({
          name: this.projectNameFiltered,
          description: this.projectDescription,
        });
        this.creating = false;
        this.projectUUID = project.data.uuid

        schema = await createSchema(this.projectUUID, {
          schema: {
            contents: this.formatted
          }
        });

        this.hasNotification = true;
        this.notificationType["is-danger"] = false;
        this.notificationType["is-info"] = true;
        this.notificationText = `Project created: ${this.projectUUID}`;
        this.creating = false;

        this.$router.push({ name: 'projects' })

      } catch(e) {
        this.hasNotification = true;
        this.notificationType["is-danger"] = true;
        this.notificationType["is-info"] = false;
        this.notificationText = "Unable to create your project at this time!"
        this.creating = false;
        return;
      }
    }
  },
  watch: {
    projectName() {
      this.projectNameFiltered = lowerCaseNoSpecialChars(this.projectName);
    }
  },
  computed: {
    shouldShowProjectNameFiltered() {
      return this.projectName !== this.projectNameFiltered;
    },
    hasModels() {
      return this.models.length > 0;
    },

    projectTitle() {
      return this.projectNameFiltered || "New Project";
    },

    hasProperties() {
      return (model) => {
        return model.properties && model.properties.length > 0;
      }
    },

    formatted() {
      return JSON.stringify({
        project: this.projectUUID || "",
        models: this.models.filter(m => {
          return m.name.trim() !== "";
        })
        .map(m => {
          m.name = camelToSnakeCase(m.name);
          if(!m.properties) return m;
          m.properties = m.properties
          .filter(p => {
            return p.name.trim() !== "";
          })
          .map(p => {
            p.name = camelToSnakeCase(p.name);
            return p;
          });
          return m;
        })
      }, null, 2).trim();
    },

    emptyPropertyMessage() {
      return (model) => {
        return model.name === "" ? "No properties for this model yet" : `No properties for ${model.name} yet`;
      }
    }
  }
}
</script>