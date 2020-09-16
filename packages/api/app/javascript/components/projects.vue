<template>
  <div>
    <template v-if="hasAcceptedUser">
      <div class="box">
        <div v-if="invites.length" class="fcolumn padding-10">
          <div class="frow">
            <img src="../images/invite.svg">
            <p class="title padding-15 grow">You've got {{invites.length}} {{invitePlural}} left!</p>
          </div>
          <p>Use them wisely</p>
          <ul class="padding-15">
            <li v-for="invite in invites" :key="invite.id">{{invite.code}}</li>
          </ul>
        </div>
      </div>
      <div class="box">
        <div class="padding-10">
          <div class="frow float-right">
            <router-link class="button is-primary" to="/new">New Project</router-link>
          </div>
          <div class="frow">
            <img src="../images/star.svg">
            <p class="title padding-15 grow">Hello! Let’s get started with a few easy steps</p>
          </div>
          <div class="fcolumn padding-top-10 padding-bottom-10">
            <p class="padding-15" v-if="!hasProjects">No projects yet</p>
            <table class="table is-fullwidth">
              <tr v-for="project in projects">
                <td>
                  <router-link :to="{name: 'project', params: {project_id: project.uuid}}">{{project.name}}</router-link>
                </td>
                <td>{{project.description}}</td>
                <td><code>{{project.uuid}}</code></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="box">
        <div class="fcolumn padding-10">
          <p>Do you have an invite code?</p>
          <form class="padding-top-10" @submit.prevent>
            <div class="field">
              <div class="control">
                <input class="input" type="text" placeholder="Invite code" v-model="inviteCode">
                <p class="help is-info" v-if="codeError">Invalid code</p>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <button class="button is-link" @click="checkInvite">It's legit</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
export default {
  mounted() {
    this.$store.dispatch('getUser');
    this.$store.dispatch('getProjects');
    this.$store.dispatch('getInvites');
  },
  data() {
    return {
      inviteCode: '',
      codeError: false,
    };
  },
  computed: {
    ...mapState([
        'projects',
        'invites',
        'user',
      ]),
    ...mapGetters([
        'hasProjects',
        'hasAcceptedUser',
      ]),
    invitePlural() {
      return this.invites.length === 1 ? "invite" : "invites";
    }
  },
  methods: {
    checkInvite() {
      this.$store.dispatch('checkInvite', this.inviteCode)
        .then((status) => {
          if(status.msg === "OK") {
            this.codeError = false;
            this.$store.dispatch('getUser');
            this.$store.dispatch('getProjects');
            this.$store.dispatch('getInvites');
          }
        })
        .catch((e) => {
          this.codeError = true;
        });
    }
  }
}
</script>