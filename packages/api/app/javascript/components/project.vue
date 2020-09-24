<template>
  <div>
    <div class="box">
      <div class="padding-10">
        <div class="fcolumn" v-if="loading">
          One sec
        </div>
        <div class="fcolumn" v-else>
          <div class="frow">
            <img src="../images/api.svg">
            <p class="title padding-left-10 flex grow">
              {{project.name}}
            </p>
          </div>
          <div class="frow">
            <p class="padding-left-10 flex grow">
            {{project.description}}
          </p>
          </div>
          <div class="tabs padding-top-10">
            <ul>
              <li :class="activeTabClass('schema')">
                <a @click="setActive('schema')">Schema</a>
              </li>
              <li :class="activeTabClass('routes')">
                <a @click="setActive('routes')">Routes</a>
              </li>
              <li :class="activeTabClass('examples')">
                <a @click="setActive('examples')">Examples</a>
              </li>
            </ul>
          </div>
          <template v-if="isActiveTab('schema')">
            <p class="padding-top-10">
              <strong>Schema</strong>
            </p>
            <div class="frow">
              <pre class="flex grow">{{project.schema}}</pre>
            </div>
          </template>
          <template v-else-if="isActiveTab('examples')">
            <div class="frow">
              <div class="grow">
                <p>Install the CLI to update your schema</p>
                <pre>npm install -g dyno</pre>
              </div>
            </div>
            <p class="padding-top-10">
              <strong>curl examples (run from your command line)</strong>
            </p>
            <div class="frow" v-if="!project.curlExamples">
              <p class="flex grow">You don't have any models yet.</p>
            </div>
            <div class="frow" v-else>
              <pre class="flex grow">{{project.curlExamples}}</pre>
            </div>
          </template>
          <template v-else>
            <p class="padding-top-10">
              <strong>Routes</strong>
            </p>
            <div class="frow">
              <pre class="flex grow">{{project.routes}}</pre>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
export default {
  data() {
    return {
      loading: false,
      currentTab: "schema",
    }
  },
  mounted() {
    this.loading = true;
    this.$store.dispatch('getProject', this.$route.params.project_id)
    .then(() => this.loading = false);
  },
  methods: {
    setActive(tab) {
      this.currentTab = tab;
    }
  },
  computed: {
    activeTabClass() {
      return (tab) => {
        return {'is-active': this.isActiveTab(tab)};  
      }
    },
    isActiveTab() {
      return (tab) => {
        return this.currentTab === tab;
      }
    },
    ...mapState(['project']),
    ...mapGetters(['projectLoaded'])
  }
}
</script>