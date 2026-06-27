import { Box, Grid } from "@mui/material";
import UniversalCategoryField from "./UniversalCategoryField";
import UniversalItemField from "./UniversalItemField";
import FoodTypeSelect from "./FoodTypeSelect";
import CategoryNickNameField from "./CategoryNickNameField";
import MenuNickNameField from "./MenuNickNameField";
import PriceField from "./PriceField";
import ActionButtons from "./ActionButtons";

export default function MenuItemCard({ item, index, menuItems, setMenuItems, restaurantId, setAlert, setLoading }) {
  const handleChange = (field, value) => {
    setMenuItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center" mb={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <UniversalCategoryField value={item.selectedUniversalCategory} onChange={(val) => handleChange("selectedUniversalCategory", val)} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <UniversalItemField value={item.selectedUniversalItem} onChange={(val) => handleChange("selectedUniversalItem", val)} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <FoodTypeSelect value={item.menu_type} onChange={(val) => handleChange("menu_type", val)} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <CategoryNickNameField value={item.category_nick_name} onChange={(val) => handleChange("category_nick_name", val)} />
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="center">
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <MenuNickNameField value={item.menu_nick_name} onChange={(val) => handleChange("menu_nick_name", val)} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <PriceField value={item.menu_item_price} onChange={(val) => handleChange("menu_item_price", val)} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 3
          }}></Grid>
        <Grid
          size={{
            xs: 12,
            md: 3
          }}>
          <ActionButtons item={item} index={index} setMenuItems={setMenuItems} restaurantId={restaurantId} setAlert={setAlert} setLoading={setLoading} />
        </Grid>
      </Grid>
    </Box>
  );
}
