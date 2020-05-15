require "application_system_test_case"

class SchemasTest < ApplicationSystemTestCase
  setup do
    @schema = schemas(:one)
  end

  test "visiting the index" do
    visit schemas_url
    assert_selector "h1", text: "Schemas"
  end

  test "creating a Schema" do
    visit schemas_url
    click_on "New Schema"

    fill_in "File", with: @schema.file
    click_on "Create Schema"

    assert_text "Schema was successfully created"
    click_on "Back"
  end

  test "updating a Schema" do
    visit schemas_url
    click_on "Edit", match: :first

    fill_in "File", with: @schema.file
    click_on "Update Schema"

    assert_text "Schema was successfully updated"
    click_on "Back"
  end

  test "destroying a Schema" do
    visit schemas_url
    page.accept_confirm do
      click_on "Destroy", match: :first
    end

    assert_text "Schema was successfully destroyed"
  end
end
